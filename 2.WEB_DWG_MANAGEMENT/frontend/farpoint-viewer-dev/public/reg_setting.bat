@echo off 
reg.exe add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\10.130.7.27" /v http /t reg_dword /d 2 /f
reg.exe add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\10.130.7.27" /v https /t reg_dword /d 2 /f
reg.exe add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\kospo.co.kr" /v http /t reg_dword /d 2 /f
reg.exe add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\kospo.co.kr" /v https /t reg_dword /d 2 /f

reg.exe add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2"/v 1201 /t reg_dword /d 0 /f
exit