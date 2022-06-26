class ForbiddenWordsList < ApplicationRecord
  belongs_to :project, optional: true
  belongs_to :organization, optional: true
  belongs_to :language_code, optional: true
  belongs_to :country_code, optional: true

  has_many :forbidden_words, dependent: :destroy

  validates :name, presence: true

  after_save :create_forbidden_words

  private

  def create_forbidden_words
    found_word_ids = []

    splitted = self.content&.split("\n") || []
    splitted.each do |word|
      if word.present?
        forbidden_word = ForbiddenWord.find_or_create_by!(content: word, forbidden_words_list_id: self.id)
        found_word_ids << forbidden_word.id
      end
    end

    self.forbidden_words.where.not(id: found_word_ids).destroy_all
  end
end
