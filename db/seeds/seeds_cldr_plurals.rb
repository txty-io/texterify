puts "\nSeeding CLDR plurals...\n\n"

# Add CLDR plurals from "seed_data/plurals_cldr_release_41.xml".
# See also https://raw.githubusercontent.com/unicode-org/cldr/release-41/common/supplemental/plurals.xml.

file = File.read('db/seed_data/plurals_cldr_release_41.xml')
xml = Nokogiri.XML(file)

parsed = {}

plural_rules_items = xml.css('pluralRules')
plural_rules_items.each do |plural_rules_item|
  plural_rules_item['locales'].split.each do |locale|
    parsed[locale] = []

    plurale_rule_items = plural_rules_item.css('pluralRule')
    plurale_rule_items.each { |plural_rule_item| parsed[locale].push(plural_rule_item['count']) }
  end
end

updated_language_plurals = 0
created_language_plurals = 0
updated_languages = 0
language_plurals_without_matching_language_code = 0

parsed.each do |code, plural_forms|
  language_plural = LanguagePlural.find_by(code: code)
  language_code = LanguageCode.find_by(code: code)

  unless language_code
    language_plurals_without_matching_language_code += 1
  end

  if language_plural
    language_plural.update!(
      code: code,
      supports_plural_zero: plural_forms.include?('zero'),
      supports_plural_one: plural_forms.include?('one'),
      supports_plural_two: plural_forms.include?('two'),
      supports_plural_few: plural_forms.include?('few'),
      supports_plural_many: plural_forms.include?('many')
    )

    updated_language_plurals += 1
  else
    LanguagePlural.create!(
      code: code,
      supports_plural_zero: plural_forms.include?('zero'),
      supports_plural_one: plural_forms.include?('one'),
      supports_plural_two: plural_forms.include?('two'),
      supports_plural_few: plural_forms.include?('few'),
      supports_plural_many: plural_forms.include?('many')
    )

    created_language_plurals += 1

    # Update existing languages plural support based on the new language plural.
    if language_code
      languages = Language.where(language_code_id: language_code.id)
      languages.each do |language|
        language.set_language_plural_support_from_language_code
        language.save!

        updated_languages += 1
      end
    end
  end
end

puts "Updated language plurals: #{updated_language_plurals}"
puts "Created language plurals: #{created_language_plurals}"
puts "Updated languages: #{updated_languages}"
puts "Language plurals without matching language code: #{language_plurals_without_matching_language_code}"

puts "\nFinished seeding CLDR plurals\n\n"
