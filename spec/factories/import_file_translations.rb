FactoryBot.define do
  factory :import_file_translation do
    other { 'Other text' }
    zero { 'Zero text' }
    one { 'One text' }
    two { 'Two text' }
    few { 'Few text' }
    many { 'Many Text' }
  end
end
