class Project < ApplicationRecord
  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  validates :name, presence: true

  belongs_to :organization, optional: true

  has_many :keys, dependent: :destroy
  has_many :languages, dependent: :destroy
  has_many :export_configs, dependent: :destroy
  has_many :flavors, dependent: :destroy
  has_many :post_processing_rules, dependent: :destroy
  has_many :translations, through: :languages
  has_many :project_users, dependent: :delete_all
  has_many :project_columns, dependent: :delete_all
  has_many :versions, class_name: 'PaperTrail::Version', dependent: :delete_all
  has_many :users_project, through: :project_users, source: :user
  has_many :releases, through: :export_configs, dependent: :destroy
  has_many :validation_violations, dependent: :destroy
  has_many :invites, class_name: 'ProjectInvite', dependent: :destroy
  has_many :background_jobs, dependent: :destroy
  has_many :imports, dependent: :destroy

  # Validations
  has_many :validations, dependent: :destroy

  # Forbidden words
  has_many :forbidden_words_lists, dependent: :destroy

  # Only returns the forbidden words of the project and not also the one
  # from the organization.
  has_many :forbidden_words, through: :forbidden_words_lists

  # Tags
  has_many :tags, dependent: :destroy

  # WordPress Polylang integration
  has_many :wordpress_contents, dependent: :destroy
  has_one :wordpress_polylang_connection, dependent: :destroy

  has_one_attached :image

  def name=(name)
    self[:name] = name.strip
  end

  def users
    organization ? User.where(id: users_project.pluck(:id) + organization.users.pluck(:id)) : users_project
  end

  def validations
    project_validations = super
    if self.organization
      project_validations << self.organization.validations
    end
    project_validations
  end

  def forbidden_words_lists
    project_forbidden_words_lists = super
    if self.organization
      project_forbidden_words_lists << self.organization.forbidden_words_lists
    end
    project_forbidden_words_lists
  end

  # The total number of validation violations.
  def issues_count
    validation_violations.where(ignored: false).size
  end

  def role_of(user)
    project_user = project_users.find_by(user_id: user.id)
    project_user ? project_user.role : organization.organization_users.find_by(user_id: user.id).role
  end

  def owners_count
    project_users.where(role: 'owner').size
  end

  def owner?(user)
    project_users.exists?(user_id: user.id, role: 'owner')
  end

  def role_of_source(user)
    project_user = project_users.find_by(user_id: user.id)
    project_user ? 'project' : 'organization'
  end

  delegate :feature_enabled?, to: :organization

  # Returns true if the languages limit has been reached.
  def max_languages_reached?
    self.organization.plan.nil? ? false : self.languages.size >= self.organization.plan&.languages_limit
  end

  # Creates the tag if it does not exist.
  # Returns the new or already existing tag.
  def create_tag_if_not_exists(name, custom)
    tag = tags.find_by(name: name, custom: custom)

    if tag.blank?
      tag = Tag.new
      tag.name = name
      tag.custom = custom
      tag.project = self
      tag.save!
    end

    tag
  end

  # Rechecks placeholders of all keys of the project.
  def check_placeholders
    project.keys.each(&:check_placeholders)
  end

  # Recalculates the words and characters count of the project.
  # This includes all translations and their content for the different
  # quantity qualifiers.
  def recalculate_words_and_characters_count!
    character_count = 0
    word_count = 0

    self.translations.each do |translation|
      if translation.zero.present?
        character_count += translation.zero.length
        word_count += translation.zero.split.length
      end
      if translation.one.present?
        character_count += translation.one.length
        word_count += translation.one.split.length
      end
      if translation.two.present?
        character_count += translation.two.length
        word_count += translation.two.split.length
      end
      if translation.few.present?
        character_count += translation.few.length
        word_count += translation.few.split.length
      end
      if translation.many.present?
        character_count += translation.many.length
        word_count += translation.many.split.length
      end
      if translation.content.present?
        character_count += translation.content.length
        word_count += translation.content.split.length
      end
    end

    self.character_count = character_count
    self.word_count = word_count
    self.save!
  end
end
