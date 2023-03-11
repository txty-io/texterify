require 'txty'

RSpec.describe Txty::Import do
  describe 'parse XLIFF' do
    it 'parses Angular extract XLIFF file' do
      file = File.read('spec/fixtures/xliff/angular_i18n_example_extract.xlf')
      parse_result = Txty::Import.parse_file_content('', file, 'xliff')

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
      parse_result = Txty::Import.parse_file_content('', file, 'xliff')

      # Because there is one target element in the XLIFF file
      # only the target content will be imported. Therefore the "source"
      # should be empty.
      expect(parse_result[:content]).to eq({ 'source' => '', 'target' => 'Target Content' })
    end
  end

  describe 'parse YAML' do
    it 'parses YAML file' do
      file = File.read('spec/fixtures/yaml/devise_example.yml')
      parse_result = Txty::Import.parse_file_content('', file, 'yaml')
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
end
