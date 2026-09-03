$git = "C:\Users\matia\git-portable\cmd\git.exe"

& $git init
& $git config user.name "migv8600-oss"
& $git config user.email "migv8600-oss@users.noreply.github.com"
& $git add .
& $git commit -m "Publicacion inicial Centro Med Antigravedad"
& $git branch -M main
try { & $git remote remove origin } catch {}
& $git remote add origin https://github.com/migv8600-oss/Proyecto.git
& $git status
