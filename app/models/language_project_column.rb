class LanguageProjectColumn < ApplicationRecord
  self.table_name = "languages_project_columns"

  belongs_to :project_column, dependent: :destroy
  belongs_to :language, dependent: :destroy
end
