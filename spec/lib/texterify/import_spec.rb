require 'rails_helper'

RSpec.describe Texterify::Import do
  describe 'parse JSON' do
    it 'parses plurals json file but flattens it' do
      file = File.read('spec/fixtures/json/json_with_plurals.json')
      parse_result = Texterify::Import.parse_file_content('', file, 'json')

      expect(parse_result[:content]).to eq(
        {
          'plural.few' => 'few text',
          'plural.many' => 'many text',
          'plural.one' => 'one text',
          'plural.other' => 'other text',
          'plural.two' => 'two text',
          'plural.zero' => 'zero text',
          'texterify_timestamp' => '2025-01-01T01:01:01Z'
        }
      )
    end

    it 'parses plurals json file' do
      file = File.read('spec/fixtures/json/json_with_plurals.json')
      parse_result = Texterify::Import.parse_file_content('', file, 'json-plurals')

      expect(parse_result[:content]).to eq(
        {
          'plural' => {
            'few' => 'few text',
            'many' => 'many text',
            'one' => 'one text',
            'other' => 'other text',
            'two' => 'two text',
            'zero' => 'zero text'
          },
          'texterify_timestamp' => '2025-01-01T01:01:01Z'
        }
      )
    end

    it 'parses invalid JSON file' do
      file = File.read('spec/fixtures/json/json_invalid.json')
      parse_result = Texterify::Import.parse_file_content('', file, 'json')

      expect(parse_result[:content]).to be_nil
    end
  end

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

  describe 'parses Rails' do
    it 'parses Rails file' do
      file = File.read('spec/fixtures/rails/rails_active_support_local_en.yml')
      parse_result = Texterify::Import.parse_file_content('', file, 'rails')
      expect(parse_result[:content]).to eq(
        {
          'date.abbr_day_names' => '["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]',
          'date.abbr_month_names' =>
            '["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]',
          'date.day_names' => '["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]',
          'date.formats.default' => '%Y-%m-%d',
          'date.formats.long' => '%B %d, %Y',
          'date.formats.short' => '%b %d',
          'date.month_names' =>
            '["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]',
          'date.order' => '["year", "month", "day"]',
          'number.currency.format.delimiter' => ',',
          'number.currency.format.format' => '%u%n',
          'number.currency.format.negative_format' => '-%u%n',
          'number.currency.format.precision' => '2',
          'number.currency.format.separator' => '.',
          'number.currency.format.significant' => 'false',
          'number.currency.format.strip_insignificant_zeros' => 'false',
          'number.currency.format.unit' => '$',
          'number.format.delimiter' => ',',
          'number.format.precision' => '3',
          'number.format.round_mode' => 'default',
          'number.format.separator' => '.',
          'number.format.significant' => 'false',
          'number.format.strip_insignificant_zeros' => 'false',
          'number.human.decimal_units.format' => '%n %u',
          'number.human.decimal_units.units.billion' => 'Billion',
          'number.human.decimal_units.units.million' => 'Million',
          'number.human.decimal_units.units.quadrillion' => 'Quadrillion',
          'number.human.decimal_units.units.thousand' => 'Thousand',
          'number.human.decimal_units.units.trillion' => 'Trillion',
          'number.human.decimal_units.units.unit' => '',
          'number.human.format.delimiter' => '',
          'number.human.format.precision' => '3',
          'number.human.format.significant' => 'true',
          'number.human.format.strip_insignificant_zeros' => 'true',
          'number.human.storage_units.format' => '%n %u',
          'number.human.storage_units.units.byte.one' => 'Byte',
          'number.human.storage_units.units.byte.other' => 'Bytes',
          'number.human.storage_units.units.eb' => 'EB',
          'number.human.storage_units.units.gb' => 'GB',
          'number.human.storage_units.units.kb' => 'KB',
          'number.human.storage_units.units.mb' => 'MB',
          'number.human.storage_units.units.pb' => 'PB',
          'number.human.storage_units.units.tb' => 'TB',
          'number.human.storage_units.units.zb' => 'ZB',
          'number.percentage.format.delimiter' => '',
          'number.percentage.format.format' => '%n%',
          'number.precision.format.delimiter' => '',
          'support.array.last_word_connector' => ', and ',
          'support.array.two_words_connector' => ' and ',
          'support.array.words_connector' => ', ',
          'time.am' => 'am',
          'time.formats.default' => '%a, %d %b %Y %H:%M:%S %z',
          'time.formats.long' => '%B %d, %Y %H:%M',
          'time.formats.short' => '%d %b %H:%M',
          'time.pm' => 'pm'
        }
      )
    end

    it 'parses different arrays' do
      file = File.read('spec/fixtures/rails/rails_different_arrays.yml')
      parse_result = Texterify::Import.parse_file_content('', file, 'rails')
      expect(parse_result[:content]).to eq(
        {
          'array_one' => '["Sunday", 3, false, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]',
          'array_two' =>
            '["", true, 1, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]',
          'array_three' => '["", "year", "month", true, "day", 2]'
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
