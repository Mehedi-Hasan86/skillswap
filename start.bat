@echo off
start "SkillSwap Server" cmd /k "cd /d %~dp0server && npm run dev"
start "SkillSwap Client" cmd /k "cd /d %~dp0client && npm run dev"
