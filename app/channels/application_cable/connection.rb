# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      client = request.params['client']
      access_token = request.params['access-token']
      uid = request.params['uid']

      current_user = User.find_by(uid: uid)

      current_user&.valid_token?(access_token, client) ? current_user : reject_unauthorized_connection
    end
  end
end
