class AddKeysCountToOrganizations < ActiveRecord::Migration[6.1]
  def change
    add_column :organizations, :keys_count, :integer, default: 0, null: false

    Organization.all.each do |organization|
      organization.keys_count = organization.projects.reduce(0) { |sum, project| sum + project.keys.size }
      organization.save!
    end
  end
end
