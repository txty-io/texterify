class ForbiddenWordSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :content, :forbidden_words_list_id
  belongs_to :forbidden_words_list
end
