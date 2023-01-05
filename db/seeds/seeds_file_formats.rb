puts 'Seeding file formats...'

formats = [
  {
    format: 'json',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true
  },
  {
    format: 'json-formatjs',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true
  },
  {
    format: 'json-poeditor',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true
  },
  {
    format: 'ios',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'toml',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'properties',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'po',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'arb',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'xliff',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'rails',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true
  },
  {
    format: 'yaml',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'typescript',
    import_support: false,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false
  },
  {
    format: 'android',
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
      import_support: format[:import_support],
      export_support: format[:export_support],
      plural_support: format[:plural_support],
      skip_empty_plural_translations_support: format[:skip_empty_plural_translations_support]
    )
    file_formats_created += 1
  else
    file_format.update!(
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
