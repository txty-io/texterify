class CreateMachineTranslationMemories < ActiveRecord::Migration[6.1]
  def change
    create_table :machine_translation_memories, id: :uuid do |t|
      t.string :from, null: false
      t.string :to, null: false

      t.references :source_country_code, type: :uuid, foreign_key: { to_table: 'country_codes' }
      t.references :source_language_code, type: :uuid, foreign_key: { to_table: 'language_codes' }, null: false
      t.references :target_country_code, type: :uuid, foreign_key: { to_table: 'country_codes' }
      t.references :target_language_code, type: :uuid, foreign_key: { to_table: 'language_codes' }, null: false

      t.timestamps
    end
  end
end
