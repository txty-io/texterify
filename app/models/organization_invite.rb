class OrganizationInvite < ApplicationRecord
  belongs_to :organization

  scope :for_email, ->(email) { where('LOWER(email) = ?', email.to_s.strip.downcase) }

  validates :email, presence: true
  validates :role, presence: true

  before_validation :normalize_email

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
