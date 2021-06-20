class ActivitySerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :item_type, :object, :object_changes, :event, :created_at

  belongs_to :user, if: proc { |object| object.whodunnit } do |object|
    User.find(object.whodunnit)
  end

  belongs_to :project, if: proc { |object| object.project_id } do |object|
    Project.find(object.project_id)
  end

  belongs_to :key,
             if:
               proc { |object|
                 if object.item_type == 'Translation'
                   (object.object_changes && object.object_changes['key_id'] && object.object_changes['key_id'][1]) ||
                     object.object['key_id']
                 end
               } do |object|
    key_id = nil
    if object.object_changes && object.object_changes['key_id'] && object.object_changes['key_id'][1]
      key_id = object.object_changes['key_id'][1]
    else
      key_id = object.object['key_id']
    end
    Key.find_by(id: key_id)
  end

  belongs_to :language,
             if:
               proc { |object|
                 if object.item_type == 'Translation'
                   (
                     object.object_changes && object.object_changes['language_id'] &&
                       object.object_changes['language_id'][1]
                   ) || object.object['language_id']
                 end
               } do |object|
    language_id = nil
    if object.object_changes && object.object_changes['language_id'] && object.object_changes['language_id'][1]
      language_id = object.object_changes['language_id'][1]
    else
      language_id = object.object['language_id']
    end
    Language.find_by(id: language_id)
  end

  has_many :translations, if: proc { |object| object.item_type == 'Key' } do |object|
    key_id = nil
    if object.object_changes && object.object_changes['id'] && object.object_changes['id'][1]
      key_id = object.object_changes['id'][1]
    else
      key_id = object.object['id']
    end
    Translation.where(key_id: key_id)
  end
end
