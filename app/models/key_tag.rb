class KeyTag < ApplicationRecord
  self.table_name = 'keys_tags'

  belongs_to :key
  belongs_to :tag
end
