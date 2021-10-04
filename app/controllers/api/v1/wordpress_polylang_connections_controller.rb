require 'rest-client'
require 'php-serialize'
require 'htmlentities'

class Api::V1::WordpressPolylangConnectionsController < Api::V1::ApiController
  def show
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection.blank?
      skip_authorization

      render json: WordpressPolylangConnectionSerializer.new(WordpressPolylangConnection.new)
    else
      authorize connection

      render json: WordpressPolylangConnectionSerializer.new(connection)
    end
  end

  # Fetches the content from the wordpress instance and stores it.
  def pull
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    unless connection.complete?
      skip_authorization
      render json: { error: true, message: 'CONNECTION_SETTINGS_NOT_COMPLETE' }, status: :bad_request
      return
    end

    authorize connection

    languages = sync_languages(project, connection)

    posts_ok = sync_content(project, languages, connection, 'post')
    pages_ok = sync_content(project, languages, connection, 'page')

    if posts_ok && pages_ok
      render json: { error: false, message: 'OK' }, status: :ok
    else
      render json: { error: true, message: 'FAILED_TO_FETCH_POSTS' }, status: :bad_request
    end
  rescue Errno::EADDRNOTAVAIL, JSON::ParserError
    render json: { error: true, message: 'FAILED_TO_PULL_POSTS' }, status: :bad_request
  end

  # Pushed the keys that are linked to a wordpress post back to the wordpress instance.
  def push
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    authorize connection

    unless connection.complete?
      skip_authorization
      render json: { error: true, message: 'CONNECTION_SETTINGS_NOT_COMPLETE' }, status: :bad_request
      return
    end

    failed_to_push_wordpress_contents = []

    project
      .keys
      # Only push wordpress keys by filtering keys without a wordpress content with the help of a inner join.
      .joins(:wordpress_contents)
      .each do |key|
        key.translations.each do |translation|
          language = translation.language

          # Check if there is already a wordpress content element for this key with the same language
          # as the translation. If so update the content of the post in wordpress.
          wordpress_content_for_translation =
            key.wordpress_contents.find_by(wordpress_language_id: language.wordpress_language_id)
          if wordpress_content_for_translation.present?
            begin
              payload = {}
              payload[wordpress_content_for_translation.wordpress_content_type] = translation.content

              response =
                RestClient::Request.new(
                  method: :post,
                  url:
                    "#{connection.wordpress_url}?rest_route=/wp/v2/#{wordpress_content_for_translation.wordpress_type}s/#{wordpress_content_for_translation.wordpress_id}",
                  user: connection.auth_user,
                  password: connection.auth_password,
                  payload: payload
                ).execute

              if response.code != 200
                failed_to_push_wordpress_contents << wordpress_content_for_translation
              end
            rescue RestClient::NotFound
              failed_to_push_wordpress_contents << wordpress_content_for_translation
            end
          else
            # If there is no wordpress content for the translation with that language create one.
            # But first create a new post if there is not already one.

            wordpress_content_for_key_of_other_language = key.wordpress_contents.first

            payload = { status: 'draft', title: key.name }
            payload[wordpress_content_for_key_of_other_language.wordpress_content_type] = translation.content

            response =
              RestClient::Request.new(
                method: :post,
                url:
                  "#{connection.wordpress_url}?rest_route=/wp/v2/#{wordpress_content_for_key_of_other_language.wordpress_type}s",
                user: connection.auth_user,
                password: connection.auth_password,
                payload: payload
              ).execute

            content = JSON.parse(response.body)

            wp_set_language(
              connection,
              content['id'],
              language.wordpress_language_code,
              wordpress_content_for_key_of_other_language.wordpress_id
            )

            content_fields = ['title', 'content', 'excerpt']
            content_fields.each do |field|
              wordpress_content = WordpressContent.new
              wordpress_content.project = project
              if field == wordpress_content_for_key_of_other_language.wordpress_content_type
                wordpress_content.key = key
              else
                key_name =
                  key.name.sub("_#{wordpress_content_for_key_of_other_language.wordpress_content_type}", "_#{field}")
                wordpress_content.key = project.keys.find_by(name: key_name)
              end
              wordpress_content.wordpress_id = content['id']
              wordpress_content.wordpress_content_type = field
              wordpress_content.wordpress_slug = content['slug']
              wordpress_content.wordpress_modified = content['modified']
              wordpress_content.wordpress_type = content['type']
              wordpress_content.wordpress_status = content['status']

              coder = HTMLEntities.new
              wordpress_content.wordpress_content = coder.decode(content[field]['rendered'])
              wordpress_content.wordpress_title = coder.decode(content['title']['rendered'])

              wordpress_content.wordpress_language_id = language.wordpress_language_id
              wordpress_content.save!
            end
          end
        end
      end

    failed_to_push_wordpress_contents
  end

  # Update the wordpress connection settings.
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

  # Creates languages, keys and translations from the synced wordpress content.
  def import
    project = current_user.projects.find(params[:project_id])
    connection = project.wordpress_polylang_connection

    if connection.blank?
      skip_authorization
      render json: { error: true, message: 'CONNECTION_SETTINGS_NOT_COMPLETE' }, status: :bad_request
      return
    end

    authorize connection

    wp_default_language_data = wp_default_language(connection)

    wordpress_content_to_import = project.wordpress_contents.find(params[:wordpress_content_ids])

    wordpress_content_to_import.each do |content|
      language = project.languages.find_by(wordpress_language_id: content.wordpress_language_id)
      linked_posts = wp_linked_posts(connection, content.wordpress_id)
      default_language_post_id = linked_posts[wp_default_language_data[:slug]]

      if default_language_post_id.present?
        # Create or update the key.
        key_name = "wp_#{default_language_post_id}_#{content.wordpress_type}_#{content.wordpress_content_type}"
        key = project.keys.find_by(name: key_name)
        if key.blank?
          key = Key.new
          key.name = key_name
          key.project = project
          key.save!
        end

        # Link the content to the key.
        content.key_id = key.id
        content.save!

        translation = project.translations.find_by(key_id: key.id, language_id: language.id, export_config_id: nil)
        if translation.blank?
          translation = Translation.new
          translation.key = key
          translation.language = language
        end

        translation.content = content.wordpress_content
        translation.save!
      end
    end

    render json: { error: false, message: 'OK' }, status: :ok
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

  # Checks if the website is reachable by sending a HEAD request and
  # checking if the response code is 200.
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

  # Checks if the wordpress site has REST enabled by trying to fetch posts
  # and then parsing them as JSON and checking if the response code is 200.
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

  # Checks if the credentials are valid by trying to load "private" posts.
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

  # Syncs languages from wordpress.
  # Returns the languages response from wordpress.
  def sync_languages(project, connection)
    response_languages =
      RestClient::Request.new(
        method: :get,
        url: "#{connection.wordpress_url}?rest_route=/wp/v2/language",
        user: connection.auth_user,
        password: connection.auth_password
      ).execute

    wp_languages = JSON.parse(response_languages.body)
    wp_languages.each do |wp_language|
      wp_language_id = wp_language['id']

      wp_language_name = wp_language['name'].parameterize

      # If the language is empty because of the "parameterize" call give it a predefined name.
      if wp_language_name.blank?
        wp_language_name = "wordpress_language_#{wp_language_id}"
      end

      # Parse language and country code.
      wp_language_description = PHP.unserialize(wp_language['description'])
      locale = wp_language_description['locale']
      parsed_locale = helpers.parse_locale(locale)
      wp_language_code = parsed_locale[:language_code]
      wp_country_code = parsed_locale[:country_code]

      language_code = LanguageCode.find_by(code: wp_language_code)
      country_code = CountryCode.find_by(code: wp_country_code)

      # Try to find a language which is linked to the wordpress language or otherwise
      # a language with the same name which is then linked to the wordpress language.
      language = project.languages.find_by(wordpress_language_id: wp_language_id)
      if language.blank?
        language = project.languages.find_by(name: wp_language_name)
      end

      # If the wordpress language doesn't exist create it.
      # Otherwise only update name to match the name of the language in wordpress.
      if language.blank?
        language = Language.new
      end

      language.language_code = language_code
      language.wordpress_language_code = wp_language['slug']
      language.country_code = country_code
      language.name = wp_language_name
      language.project = project
      language.wordpress_language_id = wp_language_id
      language.save!
    end

    wp_languages
  end

  # Syncs wordpress content to Texterify but does not automatically create new keys.
  # Save the data to the wordpress_contents table.
  def sync_content(project, languages, connection, type)
    content_fields = ['title', 'content', 'excerpt']
    found_wordpress_content_ids = []

    # https://developer.wordpress.org/rest-api/reference/posts/#schema-status
    states = ['publish', 'future', 'draft', 'pending', 'private']
    states.each do |state|
      response_posts =
        RestClient::Request.new(
          method: :get,
          url: "#{connection.wordpress_url}?rest_route=/wp/v2/#{type}s&status=#{state}",
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

          coder = HTMLEntities.new
          wordpress_content.wordpress_content = coder.decode(content[content_field]['rendered'])
          wordpress_content.wordpress_title = coder.decode(content['title']['rendered'])

          if content_language
            wordpress_content.wordpress_language_id = content_language['id']
            wordpress_content.wordpress_language_language_code = parsed_locale[:language_code]
            wordpress_content.wordpress_language_country_code = parsed_locale[:country_code]
            wordpress_content.wordpress_language_name = content_language['name']
          end

          wordpress_content.save!

          found_wordpress_content_ids << wordpress_content.id
        end
      end
    end

    # Delete all wp contents which is no longer available in the wordpress instance.
    wordpress_contents_to_delete =
      project.wordpress_contents.where(wordpress_type: type).where.not(id: found_wordpress_content_ids)
    wordpress_contents_to_delete.each(&:destroy)

    true
  rescue RestClient::BadRequest
    false
  end

  # Get the linked posts for a given post id.
  def wp_linked_posts(connection, post_id)
    linked_posts =
      RestClient::Request.new(
        method: :get,
        url: "#{connection.wordpress_url}?rest_route=/texterify/v1/linked-posts/#{post_id}",
        user: connection.auth_user,
        password: connection.auth_password
      ).execute

    response.code == '200' ? JSON.parse(linked_posts) : []
  rescue RestClient::BadRequest
    []
  end

  # Returns the default language id and slug.
  def wp_default_language(connection)
    default_language =
      RestClient::Request.new(
        method: :get,
        url: "#{connection.wordpress_url}?rest_route=/texterify/v1/default-language",
        user: connection.auth_user,
        password: connection.auth_password
      ).execute

    parsed = JSON.parse(default_language.body)

    response.code == '200' ? { id: parsed['term_id'], slug: parsed['slug'] } : nil
  rescue RestClient::BadRequest
    nil
  end

  # Sets the language of a post.
  def wp_set_language(connection, post_id, language_code, post_to_link_to_id)
    RestClient::Request.new(
      method: :put,
      url: "#{connection.wordpress_url}?rest_route=/texterify/v1/posts/#{post_id}/set-language",
      user: connection.auth_user,
      password: connection.auth_password,
      payload: {
        language_code: language_code,
        post_to_link_to_id: post_to_link_to_id
      }
    ).execute
  rescue RestClient::BadRequest
    nil
  end
end
