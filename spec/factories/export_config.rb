FactoryBot.define do
  factory :export_config do
    sequence :name do |n|
      "Test Export Config #{n}"
    end

    file_path { 'path' }
    project_id { nil }
    file_format_id { nil }
  end
end
