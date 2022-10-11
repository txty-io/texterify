puts "\nSeeding language and country codes...\n\n"

# Add ISO 3166-1-alpha-2 codes from file "seed_data/country_codes.json".
country_codes = ActiveSupport::JSON.decode(File.read('db/seed_data/country_codes.json'))
country_codes_codes = country_codes.map { |x| x['code'] }
existing_country_codes = CountryCode.where(code: country_codes_codes).map(&:code)
country_codes_to_insert = country_codes.select { |x| existing_country_codes.exclude?(x['code']) }
if country_codes_to_insert.size > 0
  now = Time.now
  CountryCode.insert_all(
    country_codes_to_insert.map do |x|
      x[:created_at] = now
      x[:updated_at] = now
      x
    end
  )
end

puts "Created country codes: #{country_codes_to_insert.size}"

# Add ISO 639-1 codes from file "seed_data/country_codes.json".
# See https://github.com/haliaeetus/iso-639/blob/master/data/iso_639-1.json.
language_codes = ActiveSupport::JSON.decode(File.read('db/seed_data/iso_639-1.json'))
language_codes = language_codes.map { |k, v| { code: v['639-1'], name: v['name'] } }
language_codes_codes = language_codes.map { |x| x[:code] }
existing_language_codes = LanguageCode.where(code: language_codes_codes).map(&:code)
language_codes_to_insert = language_codes.select { |x| existing_language_codes.exclude?(x[:code]) }
if language_codes_to_insert.size > 0
  now = Time.now
  LanguageCode.insert_all(
    language_codes_to_insert.map do |x|
      x[:created_at] = now
      x[:updated_at] = now
      x
    end
  )
end

puts "Created language codes: #{language_codes_to_insert.size}"

puts "\nFinished seeding language and country codes.\n\n"
