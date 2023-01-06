require 'rails_helper'

RSpec.describe FileFormat, type: :model do
  it 'creates a file format' do
    file_format = FileFormat.new
    file_format.format = 'My file format'
    file_format.name = 'My file format name'
    file_format.save!
  end
end
