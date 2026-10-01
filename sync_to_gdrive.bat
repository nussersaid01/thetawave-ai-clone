@echo off
set "SOURCE=C:\Users\nusse\projects\thetawave-ai-clone"
set "TARGET=G:\My Drive\00 AI Integration\02 ThetaWave AI Clone"

echo Synchronizing from %SOURCE% to %TARGET%...

robocopy "%SOURCE%" "%TARGET%" /MIR /XD node_modules .next .git /XF *.log /FFT /Z /XA:H /W:5

if %ERRORLEVEL% GEQ 8 (
    echo Robocopy failed with error level %ERRORLEVEL%.
    exit /b %ERRORLEVEL%
)

echo Sync complete!
exit /b 0
