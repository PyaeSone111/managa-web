# Windows: avoid CMake "path too long" failures for react-native-reanimated.
# Maps the project to drive M: (short path), cleans native caches, then builds.

param(
  [switch]$Release
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DriveLetter = "M:"
$Variant = if ($Release) { 'Release' } else { 'Debug' }
$AssembleTask = if ($Release) { 'assembleRelease' } else { 'assembleDebug' }

function Remove-DirIfExists($path) {
  if (Test-Path $path) {
    Remove-Item -Recurse -Force $path
  }
}

Write-Host "Cleaning native CMake caches..."
Remove-DirIfExists (Join-Path $ProjectRoot "android\app\.cxx")
Remove-DirIfExists (Join-Path $ProjectRoot "android\app\build")
Remove-DirIfExists (Join-Path $ProjectRoot "android\build")
Remove-DirIfExists (Join-Path $ProjectRoot "node_modules\react-native-reanimated\android\.cxx")
Remove-DirIfExists (Join-Path $ProjectRoot "node_modules\react-native-worklets\android\.cxx")
Remove-DirIfExists (Join-Path $ProjectRoot "node_modules\react-native-screens\android\.cxx")

$existing = (Get-PSDrive -Name ($DriveLetter.TrimEnd(':')) -ErrorAction SilentlyContinue)
if ($existing) {
  subst $DriveLetter /d | Out-Null
}

Write-Host "Mapping $DriveLetter -> $ProjectRoot"
subst $DriveLetter $ProjectRoot

try {
  Push-Location "$DriveLetter\android"
  Write-Host "Running gradlew clean..."
  .\gradlew.bat clean
  Write-Host "Building native prefab packages ($Variant)..."
  .\gradlew.bat ":react-native-worklets:prefab${Variant}Package" ":react-native-reanimated:prefab${Variant}Package"
  Write-Host "Running gradlew $AssembleTask..."
  .\gradlew.bat $AssembleTask @args
} finally {
  Pop-Location
  subst $DriveLetter /d | Out-Null
}
