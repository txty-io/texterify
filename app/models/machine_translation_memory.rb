class MachineTranslationMemory < ApplicationRecord
  validates :from, presence: true
  validates :to, presence: true
  validates :source_language_code_id, presence: true
  validates :target_language_code_id, presence: true
end
