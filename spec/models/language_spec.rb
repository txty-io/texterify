require 'rails_helper'

RSpec.describe Language, type: :model do
  it 'creates a language' do
    project = create(:project, :with_organization)
    project.save!

    language = Language.new
    language.name = 'language_name'
    language.project_id = project.id
    language.save!
  end

  it 'fails to a creates a language with the same name for a project' do
    project = create(:project, :with_organization)
    project.save!

    language = Language.new
    language.name = 'language_name'
    language.project_id = project.id
    language.save!

    language2 = Language.new
    language2.name = 'language_name'
    language2.project_id = project.id
    language2.save
    expect(language2.errors.added?(:name, :taken)).to be(true)
  end

  it 'returns a language tags' do
    project = create(:project, :with_organization)
    project.save!

    language = Language.new
    language.name = 'language_name'
    language.project_id = project.id
    language.save!

    expect(language.language_tag).to be_nil

    language_code = LanguageCode.find_by(code: 'en')
    country_code = CountryCode.find_by(code: 'US')

    language.language_code = language_code

    expect(language.language_tag).to eq('en')

    language.country_code = country_code

    expect(language.language_tag).to eq('en-US')

    language.language_code = nil

    expect(language.language_tag).to eq('US')
  end
end
