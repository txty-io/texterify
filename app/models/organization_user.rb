require 'rest-client'

class OrganizationUser < ApplicationRecord
  self.table_name = 'organizations_users'

  after_commit :update_subscription_users, on: [:create, :destroy]

  belongs_to :user
  belongs_to :organization

  private

  def update_subscription_users
    if Texterify.cloud? && organization&.active_subscription
      RestClient.put("#{ENV['PAYMENT_SERVICE_HOST']}/subscriptions/users?organization_id=#{organization.id}", {})
    end
  end
end
