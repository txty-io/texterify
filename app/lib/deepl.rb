require 'rest-client'

module Deepl
  module V2
    class Client
      API_ENDPOINT = 'https://api-free.deepl.com/v2/'.freeze

      attr_reader :auth_token

      def initialize(auth_token = nil)
        @auth_token = auth_token
      end

      def usage
        request(:get, 'usage')
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
        request(:get, 'languages', { type: 'target' })
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
        request(:get, 'languages', { type: 'source' })
      end

      def translate(text, source_lang, target_lang)
        data = {
          text: text,
          source_lang: source_lang,
          target_lang: target_lang
        }

        json = request(:post, 'translate', data)
        json['translations'][0]['text']
      end

      private

      def request(http_method, endpoint, data = nil)
        response = RestClient::Request.execute(method: http_method, url: API_ENDPOINT + endpoint, payload: data, headers: { params: { auth_key: @auth_token } })

        JSON.parse(response)
      end
    end
  end
end
