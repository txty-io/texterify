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

    sync_content(project, languages, connection, 'posts')
    sync_content(project, languages, connection, 'pages')
  rescue Errno::EADDRNOTAVAIL, JSON::ParserError
    render json: { error: true, message: 'FAILED_TO_PULL_POSTS' }, status: :bad_request
  end

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
    connection.auth_password = params[:auth_password]
    connection.save!
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

  private

  # Syncs WordPress content to Texterify but does not automatically create new keys.
  # Save the data to the wordpress_contents table.
  def sync_content(project, languages, connection, type)
    content_fields = ['title', 'content', 'excerpt']
    response_posts = RestClient.get("#{connection.wordpress_url}?rest_route=/wp/v2/#{type}")
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

        if content_language
          wordpress_content.wordpress_language_id = content_language['id']
          wordpress_content.wordpress_language_language_code = parsed_locale[:language_code]
          wordpress_content.wordpress_language_country_code = parsed_locale[:country_code]
        end

        wordpress_content.save!
      end
    end
  end
end
