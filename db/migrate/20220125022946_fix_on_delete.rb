class FixOnDelete < ActiveRecord::Migration[6.1]
  def change
    # access_tokens
    remove_foreign_key :access_tokens, :users
    add_foreign_key :access_tokens, :users, on_delete: :cascade

    # export_configs
    remove_foreign_key :export_configs, :projects
    add_foreign_key :export_configs, :projects, on_delete: :cascade

    # keys
    remove_foreign_key :keys, :projects
    add_foreign_key :keys, :projects, on_delete: :cascade

    # language_configs
    remove_foreign_key :language_configs, :languages
    add_foreign_key :language_configs, :languages, on_delete: :cascade

    remove_foreign_key :language_configs, :export_configs
    add_foreign_key :language_configs, :export_configs, on_delete: :cascade

    change_column_null :language_configs, :language_id, false
    change_column_null :language_configs, :export_config_id, false

    # languages
    remove_foreign_key :languages, :projects
    add_foreign_key :languages, :projects, on_delete: :cascade

    remove_foreign_key :languages, :country_codes
    add_foreign_key :languages, :country_codes, on_delete: :nullify

    remove_foreign_key :languages, column: :parent_id
    add_foreign_key :languages, :languages, column: :parent_id, on_delete: :nullify

    remove_foreign_key :languages, :language_codes
    add_foreign_key :languages, :language_codes, on_delete: :nullify

    # languages_project_columns
    remove_foreign_key :languages_project_columns, :languages
    add_foreign_key :languages_project_columns, :languages, on_delete: :cascade

    remove_foreign_key :languages_project_columns, :project_columns
    add_foreign_key :languages_project_columns, :project_columns, on_delete: :cascade

    # organizations_users
    remove_foreign_key :organizations_users, :organizations
    add_foreign_key :organizations_users, :organizations, on_delete: :cascade

    remove_foreign_key :organizations_users, :users
    add_foreign_key :organizations_users, :users, on_delete: :cascade

    # post_processing_rules
    remove_foreign_key :post_processing_rules, :projects
    add_foreign_key :post_processing_rules, :projects, on_delete: :cascade

    remove_foreign_key :post_processing_rules, :export_configs
    add_foreign_key :post_processing_rules, :export_configs, on_delete: :cascade

    # project_columns
    remove_foreign_key :project_columns, :projects
    add_foreign_key :project_columns, :projects, on_delete: :cascade

    remove_foreign_key :project_columns, :users
    add_foreign_key :project_columns, :users, on_delete: :cascade

    # projects
    remove_foreign_key :projects, :organizations
    add_foreign_key :projects, :organizations, on_delete: :cascade

    # projects_users
    remove_foreign_key :projects_users, :projects
    add_foreign_key :projects_users, :projects, on_delete: :cascade

    remove_foreign_key :projects_users, :users
    add_foreign_key :projects_users, :users, on_delete: :cascade

    # release_files
    remove_foreign_key :release_files, :releases
    add_foreign_key :release_files, :releases, on_delete: :cascade

    # releases
    remove_foreign_key :releases, :export_configs
    add_foreign_key :releases, :export_configs, on_delete: :cascade

    # sent_emails
    remove_foreign_key :sent_emails, :organizations
    add_foreign_key :sent_emails, :organizations, on_delete: :cascade

    remove_foreign_key :sent_emails, :users
    add_foreign_key :sent_emails, :users, on_delete: :cascade

    # translations
    remove_foreign_key :translations, :keys
    add_foreign_key :translations, :keys, on_delete: :cascade

    remove_foreign_key :translations, :languages
    add_foreign_key :translations, :languages, on_delete: :cascade

    remove_foreign_key :translations, :export_configs
    add_foreign_key :translations, :export_configs, on_delete: :cascade
  end
end
