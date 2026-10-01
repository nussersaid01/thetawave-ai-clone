$source = "C:\Users\nusse\projects\thetawave-ai-clone"
$target = "G:\My Drive\00 AI Integration\02 ThetaWave AI Clone"

Write-Host "Synchronizing from $source to $target..."

$robocopyArgs = @(
    $source,
    $target,
    "/MIR",
    "/XD", "node_modules", ".next", ".git",
    "/XF", "*.log",
    "/FFT",
    "/Z",
    "/XA:H",
    "/W:5"
)

& robocopy @robocopyArgs

if ($LASTEXITCODE -ge 8) {
    Write-Error "Robocopy failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Sync complete!"
exit 0
