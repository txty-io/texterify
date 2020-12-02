class Api::V1::RegistrationsController < DeviseTokenAuth::RegistrationsController
  def create
    super do |user|
      # The first user that registers is the superadmin user of the instance.
      unless User.exists?(is_superadmin: true)
        user.is_superadmin = true
        user.save!
      end
    end
  end
end
