class MakeBackgroundJobsUserIdNullable < ActiveRecord::Migration[6.1]
  def change
    change_column_null :background_jobs, :user_id, true
  end
end
