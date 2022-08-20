require 'rails_helper'

RSpec.describe ForbiddenWord, type: :model do
  it 'creates a forbidden word' do
    forbidden_words_list = ForbiddenWordsList.new
    forbidden_words_list.name = 'my list'
    forbidden_words_list.save!

    forbidden_word = ForbiddenWord.new
    forbidden_word.content = 'bad word'
    forbidden_word.forbidden_words_list_id = forbidden_words_list.id
    forbidden_word.save!
  end
end
