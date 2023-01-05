puts 'Seeding file formats...'

formats = [
  {
    format: 'json',
    name: 'JSON',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true
  },
  {
    format: 'json-formatjs',
    name: 'JSON Format.js',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true
  },
  {
    format: 'json-poeditor',
    name: 'JSON POEditor',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true
  },
  {
    format: 'ios',
    name: 'iOS',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'toml',
    name: 'TOML',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'properties',
    name: 'Java .properties',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'po',
    name: 'PO',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'arb',
    name: 'Flutter .arb',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'xliff',
    name: 'XLIFF .xlf, .xliff',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'rails',
    name: 'Ruby on Rails',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true
  },
  {
    format: 'yaml',
    name: 'YAML',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'typescript',
    name: 'TypeScript',
    import_support: false,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'android',
    name: 'Android',
    import_support: false,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true
  }
]

file_formats_created = 0
file_formats_updated = 0
formats.each do |format|
  file_format = FileFormat.find_by(format: format[:format])
  if file_format.nil?
    FileFormat.create!(
      format: format[:format],
      name: format[:name],
      import_support: format[:import_support],
      export_support: format[:export_support],
      plural_support: format[:plural_support],
      skip_empty_plural_translations_support: format[:skip_empty_plural_translations_support]
    )
    file_formats_created += 1
  else
    file_format.update!(
      name: format[:name],
      import_support: format[:import_support],
      export_support: format[:export_support],
      plural_support: format[:plural_support],
      skip_empty_plural_translations_support: format[:skip_empty_plural_translations_support]
    )
    file_formats_updated += 1
  end
end

puts "Created file formats: #{file_formats_created}"
puts "Updated file formats: #{file_formats_updated}"
puts "Finished seeding file formats.\n\n"
