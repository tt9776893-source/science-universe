$env:JAVA_HOME = "D:\shine negtgel\tools\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
Set-Location -Path "D:\shine negtgel\android"
.\gradlew.bat assembleDebug --no-daemon
