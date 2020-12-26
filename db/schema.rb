# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_12_26_025913) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "access_tokens", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "secret", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name", null: false
    t.index ["user_id", "name"], name: "index_access_tokens_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_access_tokens_on_user_id"
  end

  create_table "active_storage_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.uuid "record_id", null: false
    t.uuid "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "country_codes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_country_codes_on_code"
  end

  create_table "export_configs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "file_path", null: false
    t.string "default_language_file_path"
    t.uuid "project_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "file_format", null: false
    t.index ["project_id", "name"], name: "index_export_configs_on_project_id_and_name", unique: true
    t.index ["project_id"], name: "index_export_configs_on_project_id"
  end

  create_table "keys", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "description"
    t.uuid "project_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "html_enabled", default: false, null: false
    t.index ["project_id"], name: "index_keys_on_project_id"
  end

  create_table "language_codes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_language_codes_on_code"
  end

  create_table "language_configs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "language_code", null: false
    t.uuid "language_id"
    t.uuid "export_config_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["export_config_id"], name: "index_language_configs_on_export_config_id"
    t.index ["language_id", "export_config_id"], name: "index_language_configs_on_language_id_and_export_config_id", unique: true
    t.index ["language_id"], name: "index_language_configs_on_language_id"
  end

  create_table "languages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.uuid "project_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "country_code_id"
    t.uuid "parent_id"
    t.uuid "language_code_id"
    t.boolean "is_default", default: false, null: false
    t.index ["country_code_id"], name: "index_languages_on_country_code_id"
    t.index ["language_code_id"], name: "index_languages_on_language_code_id"
    t.index ["parent_id"], name: "index_languages_on_parent_id"
    t.index ["project_id", "name"], name: "index_languages_on_project_id_and_name", unique: true
    t.index ["project_id"], name: "index_languages_on_project_id"
  end

  create_table "languages_project_columns", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_column_id", null: false
    t.uuid "language_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["language_id"], name: "index_languages_project_columns_on_language_id"
    t.index ["project_column_id"], name: "index_languages_project_columns_on_project_column_id"
  end

  create_table "licenses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "data", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "organizations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_organizations_on_name", unique: true
  end

  create_table "organizations_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "organization_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "translator", null: false
    t.index ["organization_id"], name: "index_organizations_users_on_organization_id"
    t.index ["user_id", "organization_id"], name: "index_organizations_users_on_user_id_and_organization_id", unique: true
    t.index ["user_id"], name: "index_organizations_users_on_user_id"
  end

  create_table "post_processing_rules", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "search_for", null: false
    t.string "replace_with", null: false
    t.uuid "project_id", null: false
    t.uuid "export_config_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["export_config_id"], name: "index_post_processing_rules_on_export_config_id"
    t.index ["project_id", "name"], name: "index_post_processing_rules_on_project_id_and_name", unique: true
    t.index ["project_id"], name: "index_post_processing_rules_on_project_id"
  end

  create_table "project_columns", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id", null: false
    t.uuid "user_id", null: false
    t.boolean "show_name", default: true, null: false
    t.boolean "show_description", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_project_columns_on_project_id"
    t.index ["user_id"], name: "index_project_columns_on_user_id"
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "organization_id"
    t.index ["organization_id"], name: "index_projects_on_organization_id"
  end

  create_table "projects_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "project_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "translator", null: false
    t.index ["project_id"], name: "index_projects_users_on_project_id"
    t.index ["user_id", "project_id"], name: "index_projects_users_on_user_id_and_project_id", unique: true
    t.index ["user_id"], name: "index_projects_users_on_user_id"
  end

  create_table "release_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "language_code", null: false
    t.string "country_code"
    t.string "url", null: false
    t.uuid "release_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "preview_url", null: false
    t.index ["language_code", "country_code", "url", "release_id"], name: "index_release_files_unique", unique: true
    t.index ["release_id"], name: "index_release_files_on_release_id"
  end

  create_table "releases", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "version", null: false
    t.uuid "export_config_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "timestamp", null: false
    t.index ["export_config_id", "version"], name: "index_releases_on_export_config_id_and_version", unique: true
    t.index ["export_config_id"], name: "index_releases_on_export_config_id"
  end

  create_table "settings", force: :cascade do |t|
    t.string "var", null: false
    t.text "value"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["var"], name: "index_settings_on_var", unique: true
  end

  create_table "subscriptions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "stripe_id", null: false
    t.datetime "stripe_cancel_at"
    t.boolean "stripe_cancel_at_period_end", default: false, null: false
    t.datetime "stripe_canceled_at"
    t.datetime "stripe_created", null: false
    t.datetime "stripe_current_period_start", null: false
    t.datetime "stripe_current_period_end", null: false
    t.string "stripe_customer", null: false
    t.datetime "stripe_ended_at"
    t.string "stripe_status", null: false
    t.datetime "stripe_start_date", null: false
    t.string "stripe_latest_invoice", null: false
    t.uuid "organization_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "plan", null: false
    t.integer "users_count", default: 1, null: false
    t.integer "invoice_upcoming_total", default: 0, null: false
    t.boolean "canceled", default: false, null: false
    t.index ["organization_id"], name: "index_subscriptions_on_organization_id"
  end

  create_table "translations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "content"
    t.uuid "key_id", null: false
    t.uuid "language_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "export_config_id"
    t.index ["export_config_id"], name: "index_translations_on_export_config_id"
    t.index ["key_id"], name: "index_translations_on_key_id"
    t.index ["language_id"], name: "index_translations_on_language_id"
  end

  create_table "user_licenses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "data", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.uuid "user_id"
    t.index ["user_id"], name: "index_user_licenses_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "provider", default: "email", null: false
    t.string "uid", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.boolean "allow_password_change", default: false
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "username", null: false
    t.string "email", null: false
    t.json "tokens"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_superadmin"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "item_type", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.jsonb "object"
    t.datetime "created_at"
    t.jsonb "object_changes"
    t.uuid "project_id"
    t.uuid "item_id", null: false
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
    t.index ["project_id"], name: "index_versions_on_project_id"
  end

  add_foreign_key "access_tokens", "users"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "export_configs", "projects"
  add_foreign_key "keys", "projects"
  add_foreign_key "language_configs", "export_configs"
  add_foreign_key "language_configs", "languages"
  add_foreign_key "languages", "country_codes"
  add_foreign_key "languages", "language_codes"
  add_foreign_key "languages", "languages", column: "parent_id"
  add_foreign_key "languages", "projects"
  add_foreign_key "languages_project_columns", "languages"
  add_foreign_key "languages_project_columns", "project_columns"
  add_foreign_key "organizations_users", "organizations"
  add_foreign_key "organizations_users", "users"
  add_foreign_key "post_processing_rules", "export_configs"
  add_foreign_key "post_processing_rules", "projects"
  add_foreign_key "project_columns", "projects"
  add_foreign_key "project_columns", "users"
  add_foreign_key "projects", "organizations"
  add_foreign_key "projects_users", "projects"
  add_foreign_key "projects_users", "users"
  add_foreign_key "release_files", "releases"
  add_foreign_key "releases", "export_configs"
  add_foreign_key "subscriptions", "organizations"
  add_foreign_key "translations", "export_configs"
  add_foreign_key "translations", "keys"
  add_foreign_key "translations", "languages"
  add_foreign_key "user_licenses", "users"
  add_foreign_key "versions", "projects"
end
