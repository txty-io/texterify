namespace :active_storage do
    desc 'Migrate ActiveStorage files from local to DigitalOcean'
    task migrate: :environment do
        module ActiveStorage
            class Downloader
                def initialize(blob, tempdir: nil)
                    @blob = blob
                    @tempdir = tempdir
                end

                def download_blob_to_tempfile
                    open_tempfile do |file|
                        download_blob_to file
                        verify_integrity_of file
                        yield file
                    end
                end

                private

                attr_reader :blob, :tempdir

                def open_tempfile
                    file = Tempfile.open(["ActiveStorage-#{blob.id}-", blob.filename.extension_with_delimiter], tempdir)

                    begin
                        yield file
                    ensure
                        file.close!
                    end
                end

                def download_blob_to(file)
                    file.binmode
                    blob.download { |chunk| file.write(chunk) }
                    file.flush
                    file.rewind
                end

                def verify_integrity_of(file)
                    unless Digest::MD5.file(file).base64digest == blob.checksum
                        raise ActiveStorage::IntegrityError
                    end
                end
            end
        end

        module AsDownloadPatch
            def open(tempdir: nil, &block)
                ActiveStorage::Downloader.new(self, tempdir: tempdir).download_blob_to_tempfile(&block)
            end
        end

        Rails.application.config.to_prepare { ActiveStorage::Blob.send(:include, AsDownloadPatch) }

        def migrate(from, to)
            puts ActiveStorage::Blob # needed because otherwise error is thrown
            configs = Rails.configuration.active_storage.service_configurations
            from_service = ActiveStorage::Service.configure from, configs
            to_service = ActiveStorage::Service.configure to, configs

            ActiveStorage::Blob.service = from_service

            puts "#{ActiveStorage::Blob.count} Blobs to go..."
            ActiveStorage::Blob.find_each do |blob|
                print '.'
                file = Tempfile.new("file#{Time.now}")
                file.binmode
                file << blob.download
                file.rewind
                checksum = blob.checksum
                to_service.upload(blob.key, file, checksum: checksum)
            rescue Errno::ENOENT
                puts 'Rescued by Errno::ENOENT statement.'
                next
            end
        end

        migrate(:local, :digitalocean)
    end
end
