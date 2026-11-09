$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
Set-Location android
.\gradlew.bat assembleDebug
Set-Location ..
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "ScienceUniverse-debug.apk" -Force
Get-Item "ScienceUniverse-debug.apk"

