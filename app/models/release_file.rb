class ReleaseFile < ApplicationRecord
  belongs_to :release

  validates :language_code, presence: true
  validates :url, presence: true
  validates :preview_url, presence: true

  after_destroy :remove_from_storage

  def remove_from_storage
    # TODO:
  end
end
