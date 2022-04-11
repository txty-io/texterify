class User < ApplicationRecord
  include DeviseTokenAuth::Concerns::User

  # Include default devise modules. Others available are:
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable, :confirmable, :trackable

  validates :username, uniqueness: true, presence: true

  has_many :project_users, dependent: :delete_all
  has_many :user_projects, through: :project_users, source: :project

  has_many :organization_users, dependent: :delete_all
  has_many :organizations, through: :organization_users
  has_many :organization_projects, through: :organizations, source: :projects

  has_many :access_tokens, dependent: :destroy
  has_many :user_licenses, dependent: :destroy
  has_one_attached :image

  has_many :recently_viewed_projects, dependent: :destroy

  has_many :background_jobs, dependent: :nullify

  def projects
    Project.where(id: user_projects.pluck(:id) + organization_projects.pluck(:id))
  end

  def private_projects
    user_projects.where(organization_id: nil)
  end

  # Determines if an email confirmation is required after registration.
  def confirmation_required?
    ENV['EMAIL_CONFIRMATION_REQUIRED'] == 'true'
  end

  # Override Devise::Confirmable#after_confirmation
  # https://www.rubydoc.info/github/plataformatec/devise/Devise/Models/Confirmable:after_confirmation
  def after_confirmation
    if Texterify.cloud?
      UserMailer.welcome(email, username).deliver_later
    end

    # Add user to organizations with open invites.
    organization_invites = OrganizationInvite.where(email: email, open: true)
    organization_invites.each do |invite|
      organization_user = OrganizationUser.new
      organization_user.user = self
      organization_user.organization = invite.organization
      organization_user.role = invite.role
      organization_user.save!

      invite.open = false
      invite.save!
    end

    # Add user to projects with open invites.
    project_invites = ProjectInvite.where(email: email, open: true)
    project_invites.each do |invite|
      project_user = ProjectUser.new
      project_user.user = self
      project_user.project = invite.project
      project_user.role = invite.role
      project_user.save!

      invite.open = false
      invite.save!
    end
  end

  def confirmed
    !confirmed_at.nil?
  end

  # We use the Devise::Trackable module to track sign-in count and current/last sign-in timestamp.
  # However, we don't want to track IP address, but Trackable tries to, so we have to manually
  # override the accessor methods so they do nothing.
  def current_sign_in_ip; end
  def last_sign_in_ip=(_ip); end
  def current_sign_in_ip=(_ip); end
end
