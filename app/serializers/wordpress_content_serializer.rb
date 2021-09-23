class WordpressContentSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id,
             :wordpress_id,
             :wordpress_modified,
             :wordpress_type,
             :wordpress_status,
             :wordpress_content,
             :wordpress_content_type,
             :wordpress_title
end
