class InvalidFileFormatException < StandardError
  attr_reader :details

  def initialize(details)
    @details = details
    super()
  end
end
