FactoryBot.define do
  factory :import_file do
    sequence :name do |n|
      "import_file_#{n}"
    end

    import_id { import_id }
  end
end
