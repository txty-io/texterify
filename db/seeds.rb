# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

load(Rails.root.join('db', 'seeds', "#{Rails.env.downcase}.rb"))

# Add ISO 3166-1-alpha-2 codes from file "seed_data/country_codes.json".
country_codes = ActiveSupport::JSON.decode(File.read('db/seed_data/country_codes.json'))
country_codes.each do |country|
  row = CountryCode.where(code: country['code']).first_or_initialize
  row.code = country['code']
  row.name = country['name']
  row.save!
end

# Add ISO 639-1 codes from file "seed_data/country_codes.json".
# See https://github.com/haliaeetus/iso-639/blob/master/data/iso_639-1.json.
language_codes = ActiveSupport::JSON.decode(File.read('db/seed_data/iso_639-1.json'))
language_codes.each do |key, value|
  row = LanguageCode.where(code: key).first_or_initialize
  row.code = value['639-1']
  row.name = value['name']
  row.save!
end
