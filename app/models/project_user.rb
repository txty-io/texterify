require 'rest-client'

class ProjectUser < ApplicationRecord
  self.table_name = 'projects_users'

  after_commit :update_subscription_users, on: [:create, :destroy]

  attr_accessor :role_before_update

  belongs_to :user
  belongs_to :project

  private

  def update_subscription_users
    if Texterify.cloud? && project.organization&.subscription
      RestClient.put("#{ENV['PAYMENT_SERVICE_HOST']}/subscriptions/users?organization_id=#{project.organization.id}", {})
    end
  end
end
