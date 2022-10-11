class StripSerializer
  def dump(data)
    clear(data, 'id')
    clear(data, 'organization_id')
    clear(data, 'project_id')
    clear(data, 'trial_ends_at')
    clear(data, 'texterify_timestamp')

    data.ai(plain: true, indent: 2)
  end

  def clear(data, property_name)
    if data.is_a?(Hash)
      data.each do |key, value|
        if key == property_name && value.is_a?(String)
          data[key] = '__REMOVED__'
        end

        if value.is_a?(Hash)
          clear(value, property_name)
        end

        if value.is_a?(Array)
          value.each { |v| clear(v, property_name) }
        end
      end
    elsif data.is_a?(Array)
      data.each { |v| clear(v, property_name) }
    end
  end
end
