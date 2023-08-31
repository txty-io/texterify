class LinkFileFormatToExportConfigs < ActiveRecord::Migration[6.1]
  def change
    # don't add a cascade as export configs should not be deleted if there is a file format
    add_reference :export_configs, :file_format, type: :uuid, null: true
    add_foreign_key :export_configs, :file_formats

    load "#{Rails.root}/db/seeds/seeds_file_formats.rb"

    ExportConfig.all.each do |export_config|
      file_format = FileFormat.find_by(format: export_config[:file_format]) || FileFormat.find_by(format: 'json')
      export_config.file_format_id = file_format.id
      export_config.save!
    end

    change_column :export_configs, :file_format_id, :uuid, null: false
    remove_column :export_configs, :file_format
  end
end
