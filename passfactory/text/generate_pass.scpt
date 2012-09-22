set rubyCommand to "echo \"

**RUBY_FILE_CONTENT**

    \" | ruby"

on replace_chars(this_text, search_string, replacement_string)
    set AppleScript's text item delimiters to the search_string
    set the item_list to every text item of this_text
    set AppleScript's text item delimiters to the replacement_string
    set this_text to the item_list as string
    set AppleScript's text item delimiters to ""
    return this_text
end replace_chars

display dialog "Enter the password for your key/certificate file:" default answer "" with hidden answer

set rubyCommand to replace_chars(rubyCommand, "**PASSWORD**", text returned of result)

tell application "Terminal"
    activate
    set currentTab to do script rubyCommand
end tell
