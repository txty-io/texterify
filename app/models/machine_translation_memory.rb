class MachineTranslationMemory < ApplicationRecord
  validates :from, presence: true
  validates :to, presence: true
end
