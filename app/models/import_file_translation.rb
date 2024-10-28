class ImportFileTranslation < ApplicationRecord
  belongs_to :import_file

  validates :key_name, presence: true

  # Indicates if the translation content differs in any way.
  def differs_to_translation(translation)
    if !translation
      return true
    end

    zero_different = self.zero != translation.zero
    one_different = self.one != translation.one
    two_different = self.two != translation.two
    few_different = self.few != translation.few
    many_different = self.many != translation.many
    other_different = self.other != translation.content

    zero_different || one_different || two_different || few_different || many_different || other_different
  end

  def plurals_content?
    self.zero || self.one || self.two || self.few || self.many
  end
end
