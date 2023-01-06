class Api::V1::FileFormatsController < Api::V1::ApiController
  skip_before_action :verify_signed_in, only: [:file_formats, :file_format_extensions]

  # Public route
  def file_formats
    skip_authorization

    file_formats = FileFormat.all.order_by_name

    render json: FileFormatSerializer.new(file_formats).serialized_json
  end

  # Public route
  def file_format_extensions
    skip_authorization

    file_format_extensions = FileFormatExtension.all.order_by_name

    render json: FileFormatExtensionSerializer.new(file_format_extensions).serialized_json
  end
end
