# This file can't have any double quotes in it, because it will actually be
# passed in as a quoted parameter to the ruby command-line executable.

require 'base64'
require 'digest/sha1'
require 'fileutils'
require 'openssl'
require 'tmpdir'

def generate_pass(pass_name, zip_data, key_data, password)

    # Load the key and certificate
    puts '==> Loading key and certificate'
    p12 = OpenSSL::PKCS12.new(Base64.decode64(key_data), password)
    cert = p12.certificate
    key = p12.key

    # Extract teamIdentifier and passTypeIdentifier from certificate
    puts '==> Looking for developer data'
    team_identifier = nil;
    pass_type_identifier = nil;
    cert.subject.to_a.each do |part|
        part_type = part[0]
        part_value = part[1]

        if part_type == 'OU'
            team_identifier = part_value
            puts '    Found Team Identifier: ' + team_identifier
        elsif part_type == 'UID'
            pass_type_identifier = part_value
            puts '    Found Pass Type Identifier: ' + pass_type_identifier
        end
    end

    # Create a temporary directory for file work (automatically deleted)
    puts '==> Creating temporary directory'
    Dir.mktmpdir do |dir|

        FileUtils.cd dir do |cwd|

            # Unpack the current zip file
            # (unzipping requires an extra library, so use the command-line version)
            puts '==> Decoding and unzipping pass data'
            open 'infile.zip', 'w' do |io| io.write Base64.decode64(zip_data) end
            system 'unzip infile.zip'
            File.delete 'infile.zip';

            # Load the WWDR cert
            puts '==> Loading WWDR certificate'
            wwdr = OpenSSL::X509::Certificate.new(File.read 'wwdr.pem')
            File.delete 'wwdr.pem'

            # Replace placeholder values with teamIdentifier and passTypeIdentifier
            puts '==> Injecting developer data into pass.json'
            pass_text = File.read('pass.json')
            File.open('pass.json', 'w') { |file| file.write pass_text.gsub('**TEAM_IDENTIFIER**', team_identifier)
                                                                     .gsub('**PASS_TYPE_IDENTIFIER**', pass_type_identifier) }

            # Calculate the checksum for pass.json, now that it's in its final state
            puts '==> Calculating SHA-1 sum for new pass.json'
            pass_sha1 = Digest::SHA1.hexdigest File.read('pass.json')

            # Inject pass.json checksum into pass manifest
            puts '==> Injecting SHA-1 sum for new pass.json into pass manifest'
            manifest_text = File.read('manifest.json')
            File.open('manifest.json', 'w') { |file| file.write manifest_text.gsub('**PASS_SHA1**', pass_sha1) }

            # Sign the manifest
            puts '==> Signing pass manifest'
            signature = OpenSSL::PKCS7::sign(cert, key, File.read('manifest.json'), [wwdr],
                                             OpenSSL::PKCS7::BINARY | OpenSSL::PKCS7::NOATTR | OpenSSL::PKCS7::DETACHED)
            open 'signature', 'w' do |io| io.write signature.to_der end

            # Package up the final pass
            # (creating zip files requires an extra library, so use the command-line version)
            puts '==> Creating final pass file'
            system 'zip -r ' + pass_name + '.pkpass *'

            # Copy final pass to Desktop
            puts '==> Copying pass file to desktop'
            FileUtils.cp pass_name + '.pkpass', File.expand_path('~/Desktop')

            puts '==> Done! It is now safe to exit. Your pass should be on your desktop.'

        end
    end
end

generate_pass('**PASS_NAME**',

              # Zip data
              '**ZIP_DATA**',
              
              # Key data
              '**KEY_DATA**',
             
             # Password (to be filled in by AppleScript)
             '**PASSWORD**')
