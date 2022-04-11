class CustomSubscription < ApplicationRecord
  belongs_to :organization, optional: true

  validates :plan, presence: true
  validates :provider, presence: true
  validates :redeemable_by_email, presence: true
end
