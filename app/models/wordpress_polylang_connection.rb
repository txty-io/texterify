class WordpressPolylangConnection < ApplicationRecord
  belongs_to :project

  # Returns true if everything is set.
  def complete?
    self.wordpress_url.present? && self.auth_user.present? && self.auth_password.present?
  end
end
