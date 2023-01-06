require 'rails_helper'

RSpec.describe FileFormatExtension, type: :model do
  it 'creates a file format extension' do
    file_format_extension = FileFormatExtension.new
    file_format_extension.extension = 'test'
    file_format_extension.save!
  end

  it 'does not create file format extensions with the same extension' do
    file_format_extension = FileFormatExtension.new
    file_format_extension.extension = 'test'
    file_format_extension.save!

    file_format_extension = FileFormatExtension.new
    file_format_extension.extension = 'test'
    expect { file_format_extension.save! }.to raise_error(ActiveRecord::RecordNotUnique)
  end
end
