puts 'Seeding file formats...'

formats = [
  {
    format: 'json',
    name: 'JSON',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true,
    file_format_extensions: ['json']
  },
  {
    format: 'json-formatjs',
    name: 'JSON Format.js',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: true,
    file_format_extensions: ['json']
  },
  {
    format: 'json-poeditor',
    name: 'JSON POEditor',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true,
    file_format_extensions: ['json']
  },
  {
    format: 'ios',
    name: 'iOS .strings',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true,
    file_format_extensions: ['strings']
  },
  {
    format: 'stringsdict',
    name: 'iOS .stringsdict',
    import_support: true,
    export_support: false,
    plural_support: false,
    skip_empty_plural_translations_support: false,
    file_format_extensions: ['stringsdict']
  },
  {
    format: 'toml',
    name: 'TOML',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false,
    file_format_extensions: ['toml']
  },
  {
    format: 'properties',
    name: 'Java .properties',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false,
    file_format_extensions: ['properties']
  },
  {
    format: 'po',
    name: 'PO',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false,
    file_format_extensions: ['po']
  },
  {
    format: 'arb',
    name: 'Flutter .arb',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false,
    file_format_extensions: ['arb']
  },
  {
    format: 'xliff',
    name: 'XLIFF .xlf, .xliff',
    import_support: true,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false,
    file_format_extensions: ['xlf', 'xliff']
  },
  {
    format: 'rails',
    name: 'Ruby on Rails',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true,
    file_format_extensions: ['yml', 'yaml']
  },
  {
    format: 'yaml',
    name: 'YAML',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: false,
    file_format_extensions: ['yml', 'yaml']
  },
  {
    format: 'typescript',
    name: 'TypeScript',
    import_support: false,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: false,
    file_format_extensions: ['ts']
  },
  {
    format: 'android',
    name: 'Android',
    import_support: true,
    export_support: true,
    plural_support: true,
    skip_empty_plural_translations_support: true,
    file_format_extensions: ['xml']
  },
  {
    format: 'csv',
    name: 'CSV',
    import_support: false,
    export_support: true,
    plural_support: false,
    skip_empty_plural_translations_support: true,
    file_format_extensions: ['csv']
  }
]

file_formats_created = 0
file_formats_updated = 0
formats.each do |format|
  file_format = FileFormat.find_by(format: format[:format])
  if file_format.nil?
    file_format =
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

  format[:file_format_extensions].each do |extension|
    file_format_extension = FileFormatExtension.find_or_create_by!(extension: extension)
    FileFormatFileFormatExtension.find_or_create_by!(
      file_format_id: file_format.id,
      file_format_extension_id: file_format_extension.id
    )
  end
end

puts "Created file formats: #{file_formats_created}"
puts "Updated file formats: #{file_formats_updated}"
puts "Finished seeding file formats.\n\n"
