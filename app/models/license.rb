class License < ApplicationRecord
  validates :data, presence: true

  FEATURES = %i[
    basic_permission_system
    advanced_permission_system
    validations
    activity_overview
    export_hierarchy
    key_history
    tag_management
    post_processing
    html_editor
    over_the_air_translations
    project_export_config_templates
    machine_translations
    project_groups
  ].freeze

  # Sets the data from a file.
  def data_file=(file)
    self.data = file.read
  end

  def reset_license
    @license = nil
  end

  def license
    return unless data

    @license ||=
      begin
        Gitlab::License.import(data)
      rescue Gitlab::License::ImportError
        nil
      end
  end
end
