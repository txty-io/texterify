require 'rest-client'

class DeepLInvalidTokenTypeException < StandardError
  attr_reader :details

  def initialize(details)
    @details = details
    super()
  end
end

DEEPL_FREE_API = 'https://api-free.deepl.com/v2/'.freeze
DEEPL_PRO_API = 'https://api.deepl.com/v2/'.freeze

module Deepl
  module V2
    class Client
      attr_accessor :api_endpoint, :api_token

      def initialize(organization = nil)
        if organization&.uses_custom_deepl_account?
          @api_token = organization.deepl_api_token
          if organization.deepl_api_token_type == 'free'
            @api_endpoint = DEEPL_FREE_API
          elsif organization.deepl_api_token_type == 'pro'
            @api_endpoint = DEEPL_PRO_API
          else
            raise DeepLInvalidTokenTypeException.new(
                    {
                      organization_id: organization.id,
                      organization_deepl_api_token_type: organization.deepl_api_token_type
                    }
                  )
          end
        else
          @api_token = ENV.fetch('DEEPL_API_TOKEN', nil)
          @api_endpoint = DEEPL_PRO_API
        end
      end

      def set_api_credentials(api_token, api_endpoint)
        @api_token = api_token
        @api_endpoint = api_endpoint
      end

      # Response:
      # {
      #   "character_count": 180118,
      #   "character_limit": 1250000
      # }
      def usage
        if Rails.env.test?
          if @api_endpoint == DEEPL_FREE_API && @api_token == '<valid_free_token>'
            { "character_count": 1337, "character_limit": 500_000 }
          elsif @api_endpoint == DEEPL_PRO_API && @api_token == '<valid_pro_token>'
            { "character_count": 180_118, "character_limit": 1_250_000 }
          end
        else
          request(:get, 'usage')
        end
      end

      # Response:
      # [
      #   {
      #     "language": "BG",
      #     "name": "Bulgarian"
      #   },
      #   {
      #     "language": "CS",
      #     "name": "Czech"
      #   },
      #   ...
      # ]
      def target_languages
        if Rails.env.test?
          [{ "language": 'BG', "name": 'Bulgarian' }, { "language": 'CS', "name": 'Czech' }]
        else
          request(:get, 'languages', { type: 'target' })
        end
      end

      # Response:
      # [
      #   {
      #     "language": "BG",
      #     "name": "Bulgarian"
      #   },
      #   {
      #     "language": "CS",
      #     "name": "Czech"
      #   },
      #   ...
      # ]
      def source_languages
        if Rails.env.test?
          [{ "language": 'BG', "name": 'Bulgarian' }, { "language": 'CS', "name": 'Czech' }]
        else
          request(:get, 'languages', { type: 'source' })
        end
      end

      def translate(text, source_lang, target_lang)
        # For testing return the reversed text.
        if Rails.env.test?
          text.reverse
        else
          data = { text: text, source_lang: source_lang, target_lang: target_lang }

          json = request(:post, 'translate', data)

          unless json.nil?
            json['translations'][0]['text']
          end
        end
      end

      private

      def request(http_method, endpoint, data = nil)
        response =
          RestClient::Request.execute(
            method: http_method,
            url: @api_endpoint + endpoint,
            payload: data,
            headers: {
              params: {
                auth_key: @api_token
              }
            },
            proxy: ENV.fetch('http_proxy_deepl', nil)
          )
        JSON.parse(response)
      rescue => e
        Sentry.capture_exception(e)
        nil
      end
    end
  end
end
