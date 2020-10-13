class AddMissingPrimaryKeyLanguagesProjectColumns < ActiveRecord::Migration[6.0]
  def change
    add_column :languages_project_columns, :id, :uuid, primary_key: true, default: "gen_random_uuid()"
  end
end
