class Release < ApplicationRecord
  belongs_to :export_config
  has_many :release_files, dependent: :destroy

  delegate :project, to: :export_config

  validates :version, presence: true

  def latest_release_file_for_locale(locale)
    splitted = locale.split('-')

    language_code = splitted[0]

    if splitted.length == 1
      release_files.find_by(language_code: language_code, country_code: nil)
    else
      country_code = splitted[1]

      release_files.find_by(language_code: language_code, country_code: country_code)
    end
  end
end
