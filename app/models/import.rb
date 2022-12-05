class Import < ApplicationRecord
  belongs_to :project
  belongs_to :user, optional: true

  has_many_attached :files

  validates :name, presence: true
end
