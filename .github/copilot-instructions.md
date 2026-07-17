Always run terminal commands in WSL (Debian), not directly in Windows PowerShell or CMD.
Prefer command form: wsl.exe -d Debian bash -lc "cd /home/benjamin/Development/UKSRC/github/archiveUI && <command>".
If a command requires sudo, do not run it. Stop and ask the user to run it manually.
After requesting a sudo command, wait for user confirmation before continuing.
Never attempt password prompts or privilege escalation automatically.