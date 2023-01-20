puts "\nSeeding CLDR plurals..."

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

language_plurals =
  parsed.map do |code, plural_forms|
    {
      code: code,
      supports_plural_zero: plural_forms.include?('zero'),
      supports_plural_one: plural_forms.include?('one'),
      supports_plural_two: plural_forms.include?('two'),
      supports_plural_few: plural_forms.include?('few'),
      supports_plural_many: plural_forms.include?('many'),
      created_at: Time.now.utc,
      updated_at: Time.now.utc
    }
  end

language_plural_ids =
  LanguagePlural.upsert_all(
    language_plurals,
    unique_by: :code
    # TODO: Uncomment this once upgraded to Rails so the created_at field is
    # not always reset every time the seeds are executed.
    # update_only: [:supports_plural_zero, :supports_plural_one, :supports_plural_two, :supports_plural_few, :supports_plural_many]
  )

puts "Upserted language plurals: #{language_plural_ids.length}"
puts "Finished seeding CLDR plurals.\n\n"
