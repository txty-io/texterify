require 'rails_helper'

RSpec.describe DeeplTargetLanguage, type: :model do
  it 'creates a deepl target language' do
    d = DeeplTargetLanguage.new
    d.name = 'my name'
    d.language_code = 'my language code'
    d.save!
  end
end
