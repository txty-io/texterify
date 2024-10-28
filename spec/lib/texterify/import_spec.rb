require 'rails_helper'

RSpec.describe Texterify::Import do
  describe 'parse XLIFF' do
    it 'parses Angular extract XLIFF file' do
      file = File.read('spec/fixtures/xliff/angular_i18n_example_extract.xlf')
      parse_result = Texterify::Import.parse_file_content('', file, 'xliff')

      expect(parse_result[:content]).to eq(
        {
          '2002272803511843863' => '{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other { minutes ago}}',
          '2508975984005233379' =>
            '{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other { minutes ago by {VAR_SELECT, select, male {male} female {female} other {other}}}}',
          '3560311772637911677' => 'The author is ',
          '392942015236586892' => 'Angular logo',
          '3967965900462880190' => "Updated: \n",
          '4606963464835766483' => 'Updated ',
          '5206857922697139278' => 'I dont output any element',
          '7670372064920373295' => '{VAR_SELECT, select, male {male} female {female} other {other}}',
          'introductionHeader' => " Hello i18n!\n"
        }
      )
    end

    it 'parses invalid source/target XLIFF file' do
      file = File.read('spec/fixtures/xliff/source_target_invalid.xlf')
      parse_result = Texterify::Import.parse_file_content('', file, 'xliff')

      # Because there is one target element in the XLIFF file
      # only the target content will be imported. Therefore the "source"
      # should be empty.
      expect(parse_result[:content]).to eq({ 'source' => '', 'target' => 'Target Content' })
    end
  end

  describe 'parses YAML' do
    it 'parses YAML file' do
      file = File.read('spec/fixtures/yaml/devise_example.yml')
      parse_result = Texterify::Import.parse_file_content('', file, 'yaml')
      expect(parse_result[:content]).to eq(
        {
          'en.devise.confirmations.confirmed' => 'Your email address has been successfully confirmed.',
          'en.devise.failure.already_authenticated' => 'You are already signed in.',
          'en.devise.mailer.confirmation_instructions.subject' => 'Confirmation instructions',
          'en.devise.mailer.reset_password_instructions.subject' => 'Reset password instructions',
          'en.errors.messages.already_confirmed' => 'was already confirmed, please try signing in',
          'en.errors.messages.confirmation_period_expired' =>
            'needs to be confirmed within {period}, please request a new one'
        }
      )
    end
  end

  describe 'parses stringsdict' do
    it 'parses stringsdict file' do
      file = File.read('spec/fixtures/stringsdict/example.stringsdict')
      parse_result = Texterify::Import.parse_file_content('', file, 'stringsdict')
      expect(parse_result[:content]).to eq(
        {
          '%d home(s) found' => {
            one: '%d home found',
            other: '%d homes found',
            zero: 'No homes found'
          },
          'second_key' => {
            few: 'few values found',
            many: 'many values found',
            one: 'one value found',
            other: 'other values found',
            two: 'two values found',
            zero: 'zero values found'
          }
        }
      )
    end
  end

  describe 'parses android' do
    it 'parses android file' do
      file = File.read('spec/fixtures/android/example_android.xml')
      parse_result = Texterify::Import.parse_file_content('', file, 'android')
      expect(parse_result[:content]).to eq(
        {
          'my_title' => 'My title',
          'my_description' => 'My description',
          'plurals_item' => {
            other: 'other text',
            zero: 'zero text',
            one: 'one text',
            two: 'two text',
            few: 'few text',
            many: 'many text'
          },
          'plurals_item_with_one_only' => {
            other: '',
            zero: '',
            one: '123',
            two: '',
            few: '',
            many: ''
          }
        }
      )
    end
  end
end
