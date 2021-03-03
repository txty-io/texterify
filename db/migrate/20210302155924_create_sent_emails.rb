class CreateSentEmails < ActiveRecord::Migration[6.0]
  def change
    create_table :sent_emails, id: :uuid do |t|
      t.text :topic, null: false
      t.datetime :sent_at
      t.timestamps
      t.references :organization, index: true, null: true, type: :uuid, foreign_key: true
      t.references :user, index: true, null: true, type: :uuid, foreign_key: true
    end
  end
end
