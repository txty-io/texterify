class ProjectColumn < ApplicationRecord
  belongs_to :user, dependent: :destroy
  belongs_to :project, dependent: :destroy
  has_many :language_project_columns, dependent: :delete_all
  has_many :languages, through: :language_project_columns
end
