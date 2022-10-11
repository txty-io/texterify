require 'rails_helper'

RSpec.describe LanguageSerializer, type: :serializer do
  it 'returns progress correctly' do
    project = create(:project, :with_organization)
    language_one = create(:language, project_id: project.id)
    language_two = create(:language, project_id: project.id)

    expect(JSON.parse(LanguageSerializer.new(language_one).serialized_json)['data']['attributes']['progress']).to eq(
      100
    )
    expect(JSON.parse(LanguageSerializer.new(language_two).serialized_json)['data']['attributes']['progress']).to eq(
      100
    )

    key_one = create(:key, project_id: project.id)

    expect(JSON.parse(LanguageSerializer.new(language_one).serialized_json)['data']['attributes']['progress']).to eq(
      0.0
    )
    expect(JSON.parse(LanguageSerializer.new(language_two).serialized_json)['data']['attributes']['progress']).to eq(
      0.0
    )

    translation_one = create(:translation, key_id: key_one.id, language_id: language_one.id, content: nil)

    expect(JSON.parse(LanguageSerializer.new(language_one).serialized_json)['data']['attributes']['progress']).to eq(
      0.0
    )
    expect(JSON.parse(LanguageSerializer.new(language_two).serialized_json)['data']['attributes']['progress']).to eq(
      0.0
    )

    translation_one.content = 'my content'
    translation_one.save!

    expect(JSON.parse(LanguageSerializer.new(language_one).serialized_json)['data']['attributes']['progress']).to eq(
      100
    )
    expect(JSON.parse(LanguageSerializer.new(language_two).serialized_json)['data']['attributes']['progress']).to eq(
      0.0
    )

    export_config = create(:export_config, project_id: project.id)
    create(
      :translation,
      key_id: key_one.id,
      language_id: language_one.id,
      export_config_id: export_config.id,
      content: 'should not have any impact'
    )

    expect(JSON.parse(LanguageSerializer.new(language_one).serialized_json)['data']['attributes']['progress']).to eq(
      100
    )
    expect(JSON.parse(LanguageSerializer.new(language_two).serialized_json)['data']['attributes']['progress']).to eq(
      0.0
    )
  end
end
