class AddCharacterCountToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :character_count, :integer, default: 0
    add_column :projects, :word_count, :integer, default: 0

    Project.all.each do |project|
      character_count = 0
      word_count = 0

      project.translations.each do |translation|
        if !translation.key.html_enabled && translation.export_config_id.nil? && translation.content.present?
          character_count += translation.content.length
          word_count += translation.content.split(' ').length
        end
      end

      project.character_count = character_count
      project.word_count = word_count
      project.save!
    end
  end
end
