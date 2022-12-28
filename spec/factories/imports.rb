FactoryBot.define do
  factory :import do
    sequence :name do |n|
      "import_#{n}"
    end

    status { 'CREATED' }
    project_id { project_id }
  end
end
