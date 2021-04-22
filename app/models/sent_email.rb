class SentEmail < ApplicationRecord
  belongs_to :organization

  validates :topic, presence: true

  SUBSCRIPTION_EXPIRES_IN_ONE_DAY = 'SUBSCRIPTION_EXPIRES_IN_ONE_DAY'.freeze
end
