class KeyTag < ApplicationRecord
  self.table_name = 'keys_tags'

  validates :tag_id, uniqueness: { scope: [:key_id] }

  belongs_to :key
  belongs_to :tag
end
