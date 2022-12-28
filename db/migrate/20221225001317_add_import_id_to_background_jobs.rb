class AddImportIdToBackgroundJobs < ActiveRecord::Migration[6.1]
  def change
    add_reference :background_jobs, :import, type: :uuid, null: true
    add_foreign_key :background_jobs, :imports, on_delete: :nullify
  end
end
