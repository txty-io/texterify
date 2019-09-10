class Project < ApplicationRecord
  validates :name, presence: true

  # A project belongs either to a user or an organization.
  belongs_to :user, optional: true
  belongs_to :organization, optional: true

  has_many :keys, dependent: :destroy
  has_many :languages, dependent: :destroy
  has_many :translations, through: :languages
  has_many :project_users, dependent: :delete_all
  has_many :project_columns, dependent: :delete_all
  has_many :versions, class_name: 'PaperTrail::Version', dependent: :delete_all
  has_many :users, through: :project_users

  has_one_attached :image
end
