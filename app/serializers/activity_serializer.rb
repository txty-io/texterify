class ActivitySerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :item_type, :object, :object_changes, :event, :created_at

  belongs_to :user, if: Proc.new { |object| object.whodunnit } do |object|
    User.find(object.whodunnit)
  end

  belongs_to :project, if: Proc.new { |object| object.project_id } do |object|
    Project.find(object.project_id)
  end
end
