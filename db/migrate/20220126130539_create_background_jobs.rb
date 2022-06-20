class CreateBackgroundJobs < ActiveRecord::Migration[6.1]
  def change
    create_table :background_jobs, id: :uuid do |t|
      t.references :project, index: true, null: false, type: :uuid, foreign_key: { on_delete: :cascade }
      t.references :user, index: true, null: false, type: :uuid, foreign_key: { on_delete: :nullify }
      t.string :status, null: false
      t.integer :progress, null: false, default: 0
      t.string :job_type, null: false
      t.timestamps
    end
  end
end
