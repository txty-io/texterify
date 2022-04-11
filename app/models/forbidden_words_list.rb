class ForbiddenWordsList < ApplicationRecord
  belongs_to :project
  belongs_to :language, optional: true

  has_many :forbidden_words, dependent: :destroy

  validates :name, presence: true

  after_save :create_forbidden_words

  private

  def create_forbidden_words
    splitted = self.content&.split("\n") || []
    splitted.each { |word| ForbiddenWord.find_or_create_by!(content: word, forbidden_words_list_id: self.id) }
  end
end
