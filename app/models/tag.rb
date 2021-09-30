class Tag < ApplicationRecord
  belongs_to :project

  # A tag can be attached to many keys
  has_many :key_tags, dependent: :delete_all
  has_many :keys, through: :key_tags

  validates :name, presence: true
  validates :custom, inclusion: { in: [true, false] }
end
