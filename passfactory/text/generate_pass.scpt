tell application "Terminal"
    activate
    set currentTab to do script "echo \"

**RUBY_FILE_CONTENT**

    \" | ruby"
end tell
