require 'rails_helper'

RSpec.describe ImportHelper, type: :helper do
  describe 'parse XLIFF' do
    it 'parses empty XLIFF file and raises nothing imported error' do
      expect { helper.parse_file_content('', '', 'xliff') }.to raise_error('NOTHING_IMPORTED')
    end

    it 'parses Angular extract XLIFF file' do
      file = File.read('spec/fixtures/xliff/angular_i18n_example_extract.xlf')
      content = helper.parse_file_content('', file, 'xliff')

      expect(content).to eq(
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
      content = helper.parse_file_content('', file, 'xliff')

      # Because there is one target element in the XLIFF file
      # only the target content will be imported. Therefore the "source"
      # should be empty.
      expect(content).to eq({ 'source' => '', 'target' => 'Target Content' })
    end
  end
end
