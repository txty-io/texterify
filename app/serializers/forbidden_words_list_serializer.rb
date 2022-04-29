class ForbiddenWordsListSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :content, :project_id, :organization_id, :language_id
  belongs_to :project

  attribute :words_count do |object|
    object.forbidden_words.size
  end
end
