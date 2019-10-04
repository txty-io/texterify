class LanguageSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :is_default
  belongs_to :country_code
  belongs_to :language_code
  belongs_to :parent

  # Returns the progress in percent of the language translations.
  # The progress is determined by the number of non empty translations.
  # @return The progress in percent.
  attribute :progress do |language|
    total_keys = language.project.keys.count
    if total_keys.zero?
      100
    else
      translated_keys = language.translations.where.not(content: [nil, '']).count
      (translated_keys.to_f / total_keys) * 100
    end
  end
end
