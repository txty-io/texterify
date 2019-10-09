class AddExportConfigIdToTranslation < ActiveRecord::Migration[5.2]
  def change
    add_reference :translations, :export_config, type: :uuid, foreign_key: true
  end
end
