class Plan < ApplicationRecord
  has_many :organizations, dependent: :nullify

  # FEATURE_UNLIMITED_PROJECTS = :FEATURE_UNLIMITED_PROJECTS
  # FEATURE_UNLIMITED_LANGUAGES = :FEATURE_UNLIMITED_LANGUAGES
  FEATURE_PERMISSION_SYSTEM = :FEATURE_PERMISSION_SYSTEM
  FEATURE_VALIDATIONS = :FEATURE_VALIDATIONS
  FEATURE_KEY_HISTORY = :FEATURE_KEY_HISTORY
  FEATURE_EXPORT_HIERARCHY = :FEATURE_EXPORT_HIERARCHY
  FEATURE_POST_PROCESSING = :FEATURE_POST_PROCESSING
  FEATURE_PROJECT_ACTIVITY = :FEATURE_PROJECT_ACTIVITY
  FEATURE_OVER_THE_AIR = :FEATURE_OVER_THE_AIR
  FEATURE_TAGS = :FEATURE_TAGS
  FEATURE_HTML_EDITOR = :FEATURE_HTML_EDITOR
  FEATURE_MACHINE_TRANSLATION_LANGUAGE = :FEATURE_MACHINE_TRANSLATION_LANGUAGE
  FEATURE_MACHINE_TRANSLATION_SUGGESTIONS = :FEATURE_MACHINE_TRANSLATION_SUGGESTIONS
  FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE = :FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE

  def feature_enabled?(feature)
    if feature == FEATURE_PERMISSION_SYSTEM
      self.permission_system
    elsif feature == FEATURE_VALIDATIONS
      self.validations
    elsif feature == FEATURE_KEY_HISTORY
      self.key_history
    elsif feature == FEATURE_EXPORT_HIERARCHY
      self.export_hierarchy
    elsif feature == FEATURE_POST_PROCESSING
      self.post_processing
    elsif feature == FEATURE_PROJECT_ACTIVITY
      self.project_activity
    elsif feature == FEATURE_OVER_THE_AIR
      self.over_the_air
    elsif feature == FEATURE_TAGS
      self.tags
    elsif feature == FEATURE_HTML_EDITOR
      self.html_editor
    elsif feature == FEATURE_MACHINE_TRANSLATION_SUGGESTIONS
      self.machine_translation_suggestions
    elsif feature == FEATURE_MACHINE_TRANSLATION_LANGUAGE
      self.machine_translation_language
    elsif feature == FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE
      self.machine_translation_auto_translate
    end
  end

  def enabled_features
    features = []

    if self.permission_system
      features << FEATURE_PERMISSION_SYSTEM
    elsif self.validations
      features << FEATURE_VALIDATIONS
    elsif self.key_history
      features << FEATURE_KEY_HISTORY
    elsif self.export_hierarchy
      features << FEATURE_EXPORT_HIERARCHY
    elsif self.post_processing
      features << FEATURE_POST_PROCESSING
    elsif self.project_activity
      features << FEATURE_PROJECT_ACTIVITY
    elsif self.over_the_air
      features << FEATURE_OVER_THE_AIR
    elsif self.tags
      features << FEATURE_TAGS
    elsif self.html_editor
      features << FEATURE_HTML_EDITOR
    elsif self.machine_translation_suggestions
      features << FEATURE_MACHINE_TRANSLATION_SUGGESTIONS
    elsif self.machine_translation_language
      features << FEATURE_MACHINE_TRANSLATION_LANGUAGE
    elsif self.machine_translation_auto_translate
      features << FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE
    end

    features
  end
end
