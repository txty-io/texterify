puts 'Seeding file formats...'

formats = [
  'json',
  'json-formatjs',
  'json-poeditor',
  'ios',
  'toml',
  'properties',
  'po',
  'arb',
  'xliff',
  'rails',
  'yaml'
]

file_formats_created = 0
formats.each do |format|
  file_format = FileFormat.find_by(format: file_format)
  if file_format.nil?
    FileFormat.create!(format: format)
    file_formats_created += 1
  end
end

puts "Created file formats: #{file_formats_created}"
puts "Finished seeding file formats.\n\n"
