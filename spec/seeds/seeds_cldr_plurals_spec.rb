require 'rails_helper'

# rubocop:disable RSpec/DescribeClass

RSpec.describe 'Seeds:seeds_cldr_plurals.rb' do
  it 'correctly seeds CLDR plurals' do
    LanguagePlural.delete_all

    expect(LanguagePlural.all).to eq([])

    load Rails.root.join('db', 'seeds', 'seeds_cldr_plurals.rb')

    language_plurals = LanguagePlural.all.order(code: :ASC).as_json

    expect(language_plurals).to match_snapshot('language_plurals', { snapshot_serializer: StripSerializer })
  end
end

# rubocop:enable RSpec/DescribeClass
