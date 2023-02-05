class MakeProjectOrganizationIdNotNull < ActiveRecord::Migration[6.1]
  def change
    organizations_before = Organization.all.size
    organization_users_before = OrganizationUser.all.size

    Project
      .where(organization_id: nil)
      .each do |project|
        organization = Organization.new
        organization.name = "#{project.name} Organization (#{project.id})"
        organization.save!

        project.organization_id = organization.id
        project.save!

        puts "Created new organization for project #{project.name}"

        project.project_users.each do |project_user|
          organization_user = OrganizationUser.new
          organization_user.organization = organization
          organization_user.user = project_user.user
          organization_user.role = project_user.role
          organization_user.save!

          puts "Added user to new organization #{organization.name}"
        end
      end

    organizations_after = Organization.all.size
    organization_users_after = OrganizationUser.all.size

    puts "Created #{organizations_after - organizations_before} new organizations"
    puts "Created #{organization_users_after - organization_users_before} new organization users"

    change_column :projects, :organization_id, :uuid, null: false
  end
end
