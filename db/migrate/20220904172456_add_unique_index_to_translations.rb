class AddUniqueIndexToTranslations < ActiveRecord::Migration[6.1]
  def change
    Project.all.each do |project|
      translations_with_duplicates =
        project.translations.group(:language_id, :key_id, :export_config_id).select(:language_id, :key_id, :export_config_id, 'COUNT(*)').having('COUNT(*) > 1')

      translations_with_duplicates.each do |duplicate|
        translations_to_delete =
          project
            .translations
            .where(
              language_id: duplicate.language_id,
              key_id: duplicate.key_id,
              export_config_id: duplicate.export_config_id
            )
            .order(created_at: :desc)[
            1..
          ] 

        translations_to_delete.each { |translation_to_delete| translation_to_delete.destroy! }
      end
    end

    # Two indexes needed because export_config_id can be null.
    add_index :translations,
              [:key_id, :language_id, :export_config_id],
              where: '(export_config_id IS NOT NULL)',
              unique: true,
              name: 'translations_index_unique_1'
    add_index :translations,
              [:key_id, :language_id],
              where: '(export_config_id IS NULL)',
              unique: true,
              name: 'translations_index_unique_2'
  end
end
