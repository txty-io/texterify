FactoryBot.define do
  factory :file_format do
    name { 'name' }
    sequence :format do |n|
      "format #{n}"
    end
  end
end
