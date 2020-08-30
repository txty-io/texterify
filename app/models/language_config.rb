class LanguageConfig < ApplicationRecord
  validates :language_code, presence: true, format: { with: /\A[A-Za-z_][A-Za-z0-9_]*\z/ }

  belongs_to :export_config
  belongs_to :language
end
