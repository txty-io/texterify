class RemoveLanguageFromFwl < ActiveRecord::Migration[6.1]
  def change
    remove_column :forbidden_words_lists, :language_id
  end
end
