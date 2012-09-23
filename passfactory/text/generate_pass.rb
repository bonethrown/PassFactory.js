# This file can't have any double quotes in it, because it will actually be
# passed in as a quoted parameter to the ruby command-line executable.

require 'base64'
require 'fileutils'
require 'openssl'
require 'tmpdir'

def generate_pass(pass_name, zip_data, key_data, password)

    # Load the key and certificate
    puts '==> Loading key and certificate'
    p12 = OpenSSL::PKCS12.new(Base64.decode64(key_data), password)
    cert = p12.certificate
    key = p12.key

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

            # Sign the manifest
            puts '==> Signing pass manifest'
            signature = OpenSSL::PKCS7::sign(cert, key, File.read('manifest.json'), [],
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
