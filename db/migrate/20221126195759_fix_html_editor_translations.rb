class FixHtmlEditorTranslations < ActiveRecord::Migration[6.1]
  def change
    Translation.where(content: '<p><br></p>').update(content: '')
    Translation.where(content: '<p></p>').update(content: '')

    Translation.where(zero: '<p><br></p>').update(zero: '')
    Translation.where(zero: '<p></p>').update(zero: '')

    Translation.where(one: '<p><br></p>').update(one: '')
    Translation.where(one: '<p></p>').update(one: '')

    Translation.where(two: '<p><br></p>').update(two: '')
    Translation.where(two: '<p></p>').update(two: '')

    Translation.where(few: '<p><br></p>').update(few: '')
    Translation.where(few: '<p></p>').update(few: '')

    Translation.where(many: '<p><br></p>').update(many: '')
    Translation.where(many: '<p></p>').update(many: '')
  end
end
