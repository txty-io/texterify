class AddInvoiceTotalPreviewToSubscriptions < ActiveRecord::Migration[6.0]
  def change
    add_column :subscriptions, :invoice_upcoming_total, :integer, null: false, default: 0
  end
end
