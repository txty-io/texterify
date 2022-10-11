require 'rails_helper'

RSpec.describe ForbiddenWordsList, type: :model do
  it 'creates a forbidden words list' do
    forbidden_words_list = ForbiddenWordsList.new
    forbidden_words_list.name = 'my list'
    forbidden_words_list.content = "bad word\nother word\n\n\nbad word"
    forbidden_words_list.save!

    expect(ForbiddenWordsList.count).to eq(1)

    # "bad word" is 2x in the content therefore only 2
    expect(ForbiddenWord.count).to eq(2)
  end
end
