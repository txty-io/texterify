# Be sure to restart your server when you modify this file.

module Txty
  def self.cloud?
    ENV['PROPRIETARY_MODE'] == 'true'
  end

  def self.on_premise?
    ENV['PROPRIETARY_MODE'] != 'true'
  end
end
