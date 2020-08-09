class PostProcessingRuleSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :search_for, :replace_with
  belongs_to :export_config
end
