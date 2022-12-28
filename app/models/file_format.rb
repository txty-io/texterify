class FileFormat < ApplicationRecord
  validates :format, presence: true
end
