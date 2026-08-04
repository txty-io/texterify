require 'rails_helper'

RSpec.describe ImportVerifyWorker, type: :worker do
  describe '#perform' do
    it 'imports plural values with symbol keys' do
      # Build verified stand-ins for the records and Active Storage objects used by the worker.
      background_job = instance_double(BackgroundJob, start!: true, progress!: true, complete!: true)
      translation = instance_double(ImportFileTranslation, save!: true)
      translations = instance_double(ActiveRecord::Associations::CollectionProxy)
      attachment = instance_double(ActiveStorage::Blob)
      import_file =
        instance_double(
          ImportFile,
          id: 2,
          name: 'strings.xml',
          file_format: instance_double(FileFormat, format: 'android'),
          file: attachment,
          import_file_translations: translations,
          save!: true
        )
      import = instance_double(Import, import_files: [import_file], save!: true)

      # Stub record lookup, attachment reading, and creation of the staged import translation.
      allow(BackgroundJob).to receive(:find).with(1).and_return(background_job)
      allow(Import).to receive(:find).with(3).and_return(import)
      allow(attachment).to receive(:open).and_yield(StringIO.new('file content'))
      allow(translations).to receive(:find_or_initialize_by).and_return(translation)
      allow(import_file).to receive(:status=)
      allow(import).to receive(:status=)

      # Android and stringsdict parsers return plural categories as symbol keys.
      allow(Texterify::Import).to receive(:parse_file_content).and_return(
        success: true,
        content: {
          'items' => {
            zero: 'zero items',
            one: 'one item',
            two: 'two items',
            few: 'few items',
            many: 'many items',
            other: 'other items'
          }
        }
      )

      # Verify that every symbol-keyed plural category is copied to the staged translation.
      expect(translation).to receive(:zero=).with('zero items')
      expect(translation).to receive(:one=).with('one item')
      expect(translation).to receive(:two=).with('two items')
      expect(translation).to receive(:few=).with('few items')
      expect(translation).to receive(:many=).with('many items')
      expect(translation).to receive(:other=).with('other items')

      # Run the worker with the stubbed background job and import IDs.
      described_class.new.perform(1, nil, 3)
    end
  end
end
