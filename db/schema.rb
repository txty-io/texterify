# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_01_26_130539) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pg_stat_statements"
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
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "background_jobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id", null: false
    t.uuid "user_id", null: false
    t.string "status", null: false
    t.integer "progress", default: 0, null: false
    t.string "job_type", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["project_id"], name: "index_background_jobs_on_project_id"
    t.index ["user_id"], name: "index_background_jobs_on_user_id"
  end

  create_table "country_codes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_country_codes_on_code"
    t.index ["name", "code"], name: "index_country_codes_on_name_and_code", unique: true
  end

  create_table "custom_subscriptions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "plan", null: false
    t.string "provider", null: false
    t.string "provider_plan"
    t.string "provider_license_key"
    t.string "invoice_id"
    t.string "redeemable_by_email", null: false
    t.integer "max_users"
    t.integer "machine_translation_character_limit"
    t.datetime "ends_at"
    t.uuid "organization_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["organization_id"], name: "custom_subscriptions_organization_id_unique", unique: true
    t.index ["organization_id"], name: "index_custom_subscriptions_on_organization_id"
  end

  create_table "deepl_source_languages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "language_code", null: false
    t.text "name", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.text "country_code"
    t.index ["language_code", "country_code"], name: "index_deepl_source_languages_on_language_code_and_country_code", unique: true
  end

  create_table "deepl_target_languages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "language_code", null: false
    t.text "name", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.text "country_code"
    t.index ["language_code", "country_code"], name: "index_deepl_target_languages_on_language_code_and_country_code", unique: true
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

  create_table "keys_tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tag_id", null: false
    t.uuid "key_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["key_id"], name: "index_keys_tags_on_key_id"
    t.index ["tag_id", "key_id"], name: "index_keys_tags_on_tag_id_and_key_id", unique: true
    t.index ["tag_id"], name: "index_keys_tags_on_tag_id"
  end

  create_table "language_codes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_language_codes_on_code"
    t.index ["name", "code"], name: "index_language_codes_on_name_and_code", unique: true
  end

  create_table "language_configs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "language_code", null: false
    t.uuid "language_id", null: false
    t.uuid "export_config_id", null: false
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
    t.string "wordpress_language_id"
    t.string "wordpress_language_code"
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

  create_table "machine_translation_memories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "from", null: false
    t.string "to", null: false
    t.uuid "source_country_code_id"
    t.uuid "source_language_code_id", null: false
    t.uuid "target_country_code_id"
    t.uuid "target_language_code_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["source_country_code_id"], name: "index_machine_translation_memories_on_source_country_code_id"
    t.index ["source_language_code_id"], name: "index_machine_translation_memories_on_source_language_code_id"
    t.index ["target_country_code_id"], name: "index_machine_translation_memories_on_target_country_code_id"
    t.index ["target_language_code_id"], name: "index_machine_translation_memories_on_target_language_code_id"
  end

  create_table "organization_invites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", null: false
    t.string "role", default: "translator", null: false
    t.uuid "organization_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "open", default: true, null: false
    t.index ["email", "organization_id", "open"], name: "index_organization_invites_unique", unique: true
    t.index ["organization_id"], name: "index_organization_invites_on_organization_id"
  end

  create_table "organizations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "trial_ends_at"
    t.integer "machine_translation_character_usage", default: 0, null: false
    t.integer "machine_translation_character_limit", default: 10000
    t.index ["name"], name: "index_organizations_on_name", unique: true
  end

  create_table "organizations_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "organization_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "translator", null: false
    t.boolean "deactivated", default: false, null: false
    t.text "deactivated_reason"
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
    t.boolean "show_tags", default: true, null: false
    t.boolean "show_overwrites", default: true, null: false
    t.index ["project_id"], name: "index_project_columns_on_project_id"
    t.index ["user_id"], name: "index_project_columns_on_user_id"
  end

  create_table "project_invites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", null: false
    t.string "role", default: "translator", null: false
    t.boolean "open", default: true, null: false
    t.uuid "project_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["email", "project_id", "open"], name: "index_project_invites_on_email_and_project_id_and_open", unique: true
    t.index ["project_id"], name: "index_project_invites_on_project_id"
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "organization_id"
    t.boolean "machine_translation_enabled", default: true, null: false
    t.boolean "auto_translate_new_keys", default: false, null: false
    t.boolean "auto_translate_new_languages", default: false, null: false
    t.integer "machine_translation_character_usage", default: 0, null: false
    t.integer "character_count", default: 0
    t.integer "word_count", default: 0
    t.boolean "validate_leading_whitespace", default: true, null: false
    t.boolean "validate_trailing_whitespace", default: true, null: false
    t.boolean "validate_double_whitespace", default: true, null: false
    t.boolean "validate_https", default: true, null: false
    t.index ["organization_id"], name: "index_projects_on_organization_id"
  end

  create_table "projects_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "project_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "translator", null: false
    t.boolean "deactivated", default: false, null: false
    t.text "deactivated_reason"
    t.index ["project_id"], name: "index_projects_users_on_project_id"
    t.index ["user_id", "project_id"], name: "index_projects_users_on_user_id_and_project_id", unique: true
    t.index ["user_id"], name: "index_projects_users_on_user_id"
  end

  create_table "recently_viewed_projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "last_accessed", null: false
    t.uuid "project_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["project_id", "user_id"], name: "index_recently_viewed_projects_unique", unique: true
    t.index ["project_id"], name: "index_recently_viewed_projects_on_project_id"
    t.index ["user_id"], name: "index_recently_viewed_projects_on_user_id"
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

  create_table "sent_emails", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "topic", null: false
    t.datetime "sent_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.uuid "organization_id"
    t.uuid "user_id"
    t.index ["organization_id"], name: "index_sent_emails_on_organization_id"
    t.index ["user_id"], name: "index_sent_emails_on_user_id"
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

  create_table "tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.boolean "custom", null: false
    t.uuid "project_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["name", "custom", "project_id"], name: "index_tags_on_name_and_custom_and_project_id", unique: true
    t.index ["project_id"], name: "index_tags_on_project_id"
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
    t.boolean "deactivated", default: false, null: false
    t.text "deactivated_reason"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "validation_violations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "ignored", default: false, null: false
    t.uuid "project_id", null: false
    t.uuid "validation_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "name"
    t.uuid "translation_id"
    t.index ["name", "project_id", "translation_id", "validation_id"], name: "index_validation_violations_uniqueness", unique: true
    t.index ["project_id"], name: "index_validation_violations_on_project_id"
    t.index ["translation_id"], name: "index_validation_violations_on_translation_id"
    t.index ["validation_id"], name: "index_validation_violations_on_validation_id"
  end

  create_table "validations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "name", null: false
    t.text "description"
    t.text "match", null: false
    t.text "content", null: false
    t.uuid "organization_id"
    t.uuid "project_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "enabled", default: true, null: false
    t.index ["organization_id"], name: "index_validations_on_organization_id"
    t.index ["project_id"], name: "index_validations_on_project_id"
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

  create_table "wordpress_contents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "wordpress_id", null: false
    t.string "wordpress_slug"
    t.datetime "wordpress_modified", null: false
    t.string "wordpress_type", null: false
    t.string "wordpress_status", null: false
    t.string "wordpress_content"
    t.string "wordpress_content_type", null: false
    t.string "wordpress_language_id"
    t.string "wordpress_language_language_code"
    t.string "wordpress_language_country_code"
    t.string "wordpress_title"
    t.string "wordpress_language_name"
    t.uuid "project_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.uuid "key_id"
    t.index ["key_id"], name: "index_wordpress_contents_on_key_id"
    t.index ["project_id"], name: "index_wordpress_contents_on_project_id"
    t.index ["wordpress_id", "wordpress_content_type"], name: "index_wp_id_wp_content_type", unique: true
  end

  create_table "wordpress_polylang_connections", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "wordpress_url"
    t.string "auth_user"
    t.string "auth_password"
    t.uuid "project_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["project_id"], name: "index_wordpress_polylang_connections_on_project_id"
  end

  add_foreign_key "access_tokens", "users", on_delete: :cascade
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "background_jobs", "projects", on_delete: :cascade
  add_foreign_key "background_jobs", "users", on_delete: :nullify
  add_foreign_key "custom_subscriptions", "organizations", on_delete: :nullify
  add_foreign_key "export_configs", "projects", on_delete: :cascade
  add_foreign_key "keys", "projects", on_delete: :cascade
  add_foreign_key "keys_tags", "keys", on_delete: :cascade
  add_foreign_key "keys_tags", "tags", on_delete: :cascade
  add_foreign_key "language_configs", "export_configs", on_delete: :cascade
  add_foreign_key "language_configs", "languages", on_delete: :cascade
  add_foreign_key "languages", "country_codes", on_delete: :nullify
  add_foreign_key "languages", "language_codes", on_delete: :nullify
  add_foreign_key "languages", "languages", column: "parent_id", on_delete: :nullify
  add_foreign_key "languages", "projects", on_delete: :cascade
  add_foreign_key "languages_project_columns", "languages", on_delete: :cascade
  add_foreign_key "languages_project_columns", "project_columns", on_delete: :cascade
  add_foreign_key "machine_translation_memories", "country_codes", column: "source_country_code_id"
  add_foreign_key "machine_translation_memories", "country_codes", column: "target_country_code_id"
  add_foreign_key "machine_translation_memories", "language_codes", column: "source_language_code_id"
  add_foreign_key "machine_translation_memories", "language_codes", column: "target_language_code_id"
  add_foreign_key "organization_invites", "organizations", on_delete: :cascade
  add_foreign_key "organizations_users", "organizations", on_delete: :cascade
  add_foreign_key "organizations_users", "users", on_delete: :cascade
  add_foreign_key "post_processing_rules", "export_configs", on_delete: :cascade
  add_foreign_key "post_processing_rules", "projects", on_delete: :cascade
  add_foreign_key "project_columns", "projects", on_delete: :cascade
  add_foreign_key "project_columns", "users", on_delete: :cascade
  add_foreign_key "project_invites", "projects", on_delete: :cascade
  add_foreign_key "projects", "organizations", on_delete: :cascade
  add_foreign_key "projects_users", "projects", on_delete: :cascade
  add_foreign_key "projects_users", "users", on_delete: :cascade
  add_foreign_key "recently_viewed_projects", "projects", on_delete: :cascade
  add_foreign_key "recently_viewed_projects", "users", on_delete: :cascade
  add_foreign_key "release_files", "releases", on_delete: :cascade
  add_foreign_key "releases", "export_configs", on_delete: :cascade
  add_foreign_key "sent_emails", "organizations", on_delete: :cascade
  add_foreign_key "sent_emails", "users", on_delete: :cascade
  add_foreign_key "subscriptions", "organizations"
  add_foreign_key "tags", "projects", on_delete: :cascade
  add_foreign_key "translations", "export_configs", on_delete: :cascade
  add_foreign_key "translations", "keys", on_delete: :cascade
  add_foreign_key "translations", "languages", on_delete: :cascade
  add_foreign_key "user_licenses", "users"
  add_foreign_key "validation_violations", "projects"
  add_foreign_key "validation_violations", "translations"
  add_foreign_key "validation_violations", "validations"
  add_foreign_key "validations", "organizations"
  add_foreign_key "validations", "projects"
  add_foreign_key "versions", "projects"
  add_foreign_key "wordpress_contents", "keys", on_delete: :nullify
  add_foreign_key "wordpress_contents", "projects", on_delete: :cascade
  add_foreign_key "wordpress_polylang_connections", "projects", on_delete: :cascade
end
