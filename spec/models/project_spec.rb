require 'rails_helper'

RSpec.describe Project, type: :model do
  it 'recalculates words and characters correctly' do
    project = create(:project, :with_organization)
    language = create(:language, project_id: project.id)
    key = create(:key, project_id: project.id)

    expect(project.character_count).to eq(0)
    expect(project.word_count).to eq(0)

    project.character_count = 100
    project.word_count = 100
    project.save!

    project.recalculate_words_and_characters_count!
    project.reload

    expect(project.character_count).to eq(0)
    expect(project.word_count).to eq(0)

    create(:translation, key_id: key.id, language_id: language.id, content: 'hello world')

    project.recalculate_words_and_characters_count!
    project.reload

    expect(project.character_count).to eq('hello world'.size)
    expect(project.word_count).to eq(2)

    create(:translation, key_id: key.id, language_id: language.id, content: 'a  b  c')

    project.recalculate_words_and_characters_count!
    project.reload

    expect(project.character_count).to eq('hello world'.size + 'a  b  c'.size)
    expect(project.word_count).to eq(5)

    create(
      :translation,
      key_id: key.id,
      language_id: language.id,
      content: '1',
      zero: '1',
      one: '1',
      two: '1',
      few: '1',
      many: '1'
    )

    project.recalculate_words_and_characters_count!
    project.reload

    expect(project.character_count).to eq('hello world'.size + 'a  b  c'.size + 6)
    expect(project.word_count).to eq(11)
  end
end
