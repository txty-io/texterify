require 'rails_helper'

RSpec.describe DeeplSourceLanguage, type: :model do
  it 'creates a deepl source language' do
    d = DeeplSourceLanguage.new
    d.name = 'my name'
    d.language_code = 'my language code'
    d.save!
  end
end
