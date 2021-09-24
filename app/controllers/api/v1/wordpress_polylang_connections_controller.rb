require 'rest-client'
require 'php-serialize'

class Api::V1::WordpressPolylangConnectionsController < Api::V1::ApiController
  def show
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection.blank?
      skip_authorization

      render json: nil
    else
      authorize connection

      render json: WordpressPolylangConnectionSerializer.new(connection)
    end
  end

  # Fetches the content from the WordPress instance and stores it.
  def pull
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection.blank? || connection.wordpress_url.blank?
      skip_authorization
      render json: { error: true, message: 'CONNECTION_SETTINGS_NOT_COMPLETE' }, status: :bad_request
      return
    end

    authorize connection

    response_languages = RestClient.get("#{connection.wordpress_url}?rest_route=/wp/v2/language")
    languages = JSON.parse(response_languages.body)

    posts_ok = sync_content(project, languages, connection, 'posts')
    pages_ok = sync_content(project, languages, connection, 'pages')

    if posts_ok && pages_ok
      render json: { error: false, message: 'OK' }, status: :bad_request
    else
      render json: { error: true, message: 'FAILED_TO_FETCH_POSTS' }, status: :bad_request
    end
  rescue Errno::EADDRNOTAVAIL, JSON::ParserError
    render json: { error: true, message: 'FAILED_TO_PULL_POSTS' }, status: :bad_request
  end

  # Update the connection settings.
  def update
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection.blank?
      connection = WordpressPolylangConnection.new
      connection.project = project
    end

    authorize connection

    connection.wordpress_url = params[:wordpress_url]
    connection.auth_user = params[:auth_user]

    if params[:auth_password].present?
      connection.auth_password = params[:auth_password]
    end

    connection.save!
  end

  # Creates languages, keys and translations from the synced WordPress content.
  def import
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection.blank?
      skip_authorization
      render json: { error: true, message: 'CONNECTION_SETTINGS_NOT_COMPLETE' }, status: :bad_request
      return
    end

    authorize connection

    wordpress_content_to_import = project.wordpress_contents.find(params[:wordpress_content_ids])

    wordpress_content_to_import.each do |content|
      wp_language_code = content.wordpress_language_language_code
      wp_country_code = content.wordpress_language_country_code

      language_code = LanguageCode.find_by(code: wp_language_code)
      country_code = CountryCode.find_by(code: wp_country_code)

      if language_code.present? || country_code.present?
        language = project.languages.find_by(language_code_id: language_code&.id, country_code_id: country_code&.id)
      end

      # If the language of the imported content doesn't exist create it.
      if language.blank?
        language = Language.new

        if language_code
          language.language_code = language_code
        end

        if country_code
          language.country_code = country_code
        end

        language.name = content.wordpress_language_name
        language.project = project
        language.save!
      end

      # Create or update the key
      key_name = "wp_#{content.wordpress_id}_#{content.wordpress_type}_#{content.wordpress_content_type}"
      key = project.keys.find_or_initialize_by(name: key_name)
      key.project = project
      key.save!

      # Add tag to mark the key as a WordPress key.
      key.add_tag_if_not_added('WordPress', false)

      translation = project.translations.find_by(key_id: key.id, language_id: language.id, export_config_id: nil)
      if translation.blank?
        translation = Translation.new
        translation.key = key
        translation.language = language
      end

      translation.content = content.wordpress_content
      translation.save!
    end

    render json: { error: false, message: 'OK' }, status: :bad_request
  end

  # Returns the synced content that can be imported for translation.
  def contents
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection.blank?
      skip_authorization
      render json: { error: true, message: 'CONNECTION_SETTINGS_NOT_COMPLETE' }, status: :bad_request
      return
    end

    authorize connection

    contents = project.wordpress_contents.order(created_at: :asc)

    render json: WordpressContentSerializer.new(contents)
  end

  def website_reachable
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection&.wordpress_url.present?
      authorize connection

      response = RestClient.head(connection.wordpress_url)

      render json: response.code == 200
    else
      skip_authorization

      render json: false
    end
  rescue Errno::EADDRNOTAVAIL
    false
  end

  def wordpress_rest_activated
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection&.wordpress_url.present?
      authorize connection

      response = RestClient.get("#{connection.wordpress_url}?rest_route=/wp/v2/posts")

      # Try to parse the response as JSON.
      JSON.parse(response.body)

      render json: response.code == 200
    else
      skip_authorization

      render json: false
    end
  rescue Errno::EADDRNOTAVAIL, JSON::ParserError
    false
  end

  def authentication_valid
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection&.wordpress_url.present?
      authorize connection

      # Check authentication by trying to fetch private posts.
      response =
        RestClient::Request.new(
          method: :get,
          url: "#{connection.wordpress_url}?rest_route=/wp/v2/posts&status=private",
          user: connection.auth_user,
          password: connection.auth_password
        ).execute

      # Try to parse the response as JSON.
      JSON.parse(response.body)

      render json: response.code == 200
    else
      skip_authorization

      render json: false
    end
  rescue Errno::EADDRNOTAVAIL, JSON::ParserError, RestClient::BadRequest
    false
  end

  private

  # Syncs WordPress content to Texterify but does not automatically create new keys.
  # Save the data to the wordpress_contents table.
  def sync_content(project, languages, connection, type)
    content_fields = ['title', 'content', 'excerpt']

    # https://developer.wordpress.org/rest-api/reference/posts/#schema-status
    states = ['publish', 'future', 'draft', 'pending', 'private']
    states.each do |state|
      response_posts =
        RestClient::Request.new(
          method: :get,
          url: "#{connection.wordpress_url}?rest_route=/wp/v2/#{type}&status=#{state}",
          user: connection.auth_user,
          password: connection.auth_password
        ).execute

      contents = JSON.parse(response_posts.body)
      contents.each do |content|
        content_language = languages.find { |language| language['id'] == content['language'][0] }
        if content_language
          content_language_description = PHP.unserialize(content_language['description'])
          locale = content_language_description['locale']
          parsed_locale = helpers.parse_locale(locale)
        end

        content_fields.each do |content_field|
          wordpress_content =
            project.wordpress_contents.find_or_initialize_by(
              wordpress_id: content['id'],
              wordpress_content_type: content_field
            )
          wordpress_content.wordpress_slug = content['slug']
          wordpress_content.wordpress_modified = content['modified']
          wordpress_content.wordpress_type = content['type']
          wordpress_content.wordpress_status = content['status']
          wordpress_content.wordpress_content = content[content_field]['rendered']
          wordpress_content.wordpress_title = content['title']['rendered']

          if content_language
            wordpress_content.wordpress_language_id = content_language['id']
            wordpress_content.wordpress_language_language_code = parsed_locale[:language_code]
            wordpress_content.wordpress_language_country_code = parsed_locale[:country_code]
            wordpress_content.wordpress_language_name = content_language['name']
          end

          wordpress_content.save!
        end
      end
    end

    true
  rescue RestClient::BadRequest
    false
  end
end
