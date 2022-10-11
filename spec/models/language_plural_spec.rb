require 'rails_helper'

RSpec.describe LanguagePlural, type: :model do
  it 'creates a language plural' do
    l = LanguagePlural.new
    l.code = 'my cde'
    l.supports_plural_zero = 'my zero'
    l.supports_plural_one = 'my one'
    l.supports_plural_two = 'my two'
    l.supports_plural_few = 'my few'
    l.supports_plural_many = 'my many'
    l.save!
  end
end
