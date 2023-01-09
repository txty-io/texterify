class ExportConfigSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id,
             :name,
             :file_format,
             :flavor_id,
             :file_path,
             :file_path_stringsdict,
             :default_language_file_path,
             :default_language_file_path_stringsdict,
             :split_on,
             :skip_empty_plural_translations

  has_many :language_configs
  belongs_to :flavor
end
