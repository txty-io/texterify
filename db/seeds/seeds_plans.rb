puts 'Seeding plans...'

plans = [
  {
    name: 'free',
    keys_limit: nil,
    projects_limit: nil,
    languages_limit: 2,
    permission_system: false,
    validations: false,
    key_history: false,
    export_hierarchy: false,
    post_processing: false,
    project_activity: false,
    tags: true,
    machine_translation_suggestions: false,
    machine_translation_language: false,
    machine_translation_auto_translate: false,
    machine_translation_character_limit: 0,
    over_the_air: false,
    html_editor: false,
    created_at: Time.now.utc,
    updated_at: Time.now.utc
  },
  {
    name: 'trial',
    keys_limit: nil,
    projects_limit: nil,
    languages_limit: 2,
    permission_system: true,
    validations: true,
    key_history: true,
    export_hierarchy: true,
    post_processing: true,
    project_activity: true,
    tags: true,
    machine_translation_suggestions: true,
    machine_translation_language: true,
    machine_translation_auto_translate: true,
    machine_translation_character_limit: 10_000,
    over_the_air: false,
    html_editor: true,
    created_at: Time.now.utc,
    updated_at: Time.now.utc
  },
  {
    name: 'basic',
    keys_limit: nil,
    projects_limit: nil,
    languages_limit: nil,
    permission_system: true,
    validations: false,
    key_history: false,
    export_hierarchy: false,
    post_processing: false,
    project_activity: false,
    tags: true,
    machine_translation_suggestions: false,
    machine_translation_language: false,
    machine_translation_auto_translate: false,
    machine_translation_character_limit: 10_000,
    over_the_air: false,
    html_editor: false,
    created_at: Time.now.utc,
    updated_at: Time.now.utc
  },
  {
    name: 'team',
    keys_limit: nil,
    projects_limit: nil,
    languages_limit: nil,
    permission_system: true,
    validations: true,
    key_history: true,
    export_hierarchy: true,
    post_processing: true,
    project_activity: true,
    tags: true,
    machine_translation_suggestions: true,
    machine_translation_language: true,
    machine_translation_auto_translate: false,
    machine_translation_character_limit: 10_000,
    over_the_air: false,
    html_editor: false,
    created_at: Time.now.utc,
    updated_at: Time.now.utc
  },
  {
    name: 'business',
    keys_limit: nil,
    projects_limit: nil,
    languages_limit: nil,
    permission_system: true,
    validations: true,
    key_history: true,
    export_hierarchy: true,
    post_processing: true,
    project_activity: true,
    tags: true,
    machine_translation_suggestions: true,
    machine_translation_language: true,
    machine_translation_auto_translate: true,
    machine_translation_character_limit: 10_000,
    over_the_air: true,
    html_editor: true,
    created_at: Time.now.utc,
    updated_at: Time.now.utc
  }
]

plan_ids =
  Plan.upsert_all(
    plans,
    unique_by: :name
    # TODO: Uncomment this once upgraded to Rails so the created_at field is
    # not always reset every time the seeds are executed.
    # update_only: [:supports_plural_zero, :supports_plural_one, :supports_plural_two, :supports_plural_few, :supports_plural_many]
  )

puts "Upserted plans: #{plan_ids.length}"
puts "Finished seeding plans.\n\n"
