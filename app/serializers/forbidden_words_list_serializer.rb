class ForbiddenWordsListSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :content, :project_id, :organization_id, :language_code_id, :country_code_id

  belongs_to :organization
  belongs_to :project
  belongs_to :language_code
  belongs_to :country_code

  attribute :words_count do |object|
    object.forbidden_words.size
  end
end
