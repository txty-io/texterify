module ReleasesHelper
  include ExportHelper

  def create_release(project, export_config, from, to)
    timestamp = Time.now.to_i

    if from == to
      bucket_path = "#{project.id}/#{export_config.id}/#{from}-#{timestamp}.zip"
    else
      bucket_path = "#{project.id}/#{export_config.id}/#{from}-#{to}-#{timestamp}.zip"
    end

    file = Tempfile.new(project.id)

    begin
      create_export(project, export_config, file)
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
end
