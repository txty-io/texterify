class AddTrialEndsAt < ActiveRecord::Migration[6.0]
  def change
    add_column :organizations, :trial_ends_at, :datetime
  end
end
