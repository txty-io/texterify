class Tag < ApplicationRecord
  belongs_to :project

  has_many :key_tags, dependent: :destroy
  has_many :keys, through: :key_tags

  validates :name, presence: true
  validates :custom, inclusion: { in: [true, false] }
end
