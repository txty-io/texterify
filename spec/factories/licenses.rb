FactoryBot.define do
  factory :license do
    sequence :data do |n|
      "data #{n}"
    end
  end
end
