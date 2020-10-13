module ReleasesHelper
  include ExportHelper

  def create_release(project, export_config, from, to)
    timestamp = Time.now.utc.iso8601

    if from == to
      bucket_path = "#{project.id}/#{export_config.id}/#{from}-#{timestamp}.json"
    else
      bucket_path = "#{project.id}/#{export_config.id}/#{from}-#{to}-#{timestamp}.json"
    end

    file = Tempfile.new(project.id)

    begin
      create_release_export(project, export_config, file, timestamp)
    ensure
      file.close
    end

    storage = Google::Cloud::Storage.new
    bucket = storage.bucket(ENV['GOOGLE_CLOUD_OTA_BUCKET_NAME'], skip_lookup: true)

    file = bucket.create_file(file.path, bucket_path)

    release = Release.new
    release.url = file.media_url
    release.export_config = export_config
    release.from_version = from
    release.to_version = to
    release.save!

    release
  end

  def create_release_export(project, export_config, file, timestamp)
    post_processing_rules = project.post_processing_rules
      .where(export_config_id: [export_config.id, nil])
      .order_by_name

    export_data = []
    project.languages.order_by_name.each do |language|
      language_data = create_language_export_data(project, export_config, language, post_processing_rules, true)

      export_data << {
        is_default: language.is_default,
        language_code: language.language_code ? language.language_code.code : nil,
        country_code: language.country_code ? language.country_code.code : nil,
        texts: language_data.map{ |key, value| { key: key, value: value }},
        plurals: [] # TODO: Add plural support
      }
    end

    file.puts({ timestamp: timestamp, data: export_data }.to_json)
  end
end
