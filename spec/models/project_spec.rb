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

    translation = create(:translation, key_id: key.id, language_id: language.id, content: 'hello world')

    project.recalculate_words_and_characters_count!
    project.reload

    expect(project.character_count).to eq('hello world'.size)
    expect(project.word_count).to eq(2)

    translation.content = 'a  b  c'
    translation.save!

    project.recalculate_words_and_characters_count!
    project.reload

    expect(project.character_count).to eq('a  b  c'.size)
    expect(project.word_count).to eq(3)

    translation.content = '1'
    translation.zero = '1'
    translation.one = '1'
    translation.two = '1'
    translation.few = '1'
    translation.many = '1'
    translation.save!

    project.recalculate_words_and_characters_count!
    project.reload

    expect(project.character_count).to eq(6)
    expect(project.word_count).to eq(6)
  end
end
