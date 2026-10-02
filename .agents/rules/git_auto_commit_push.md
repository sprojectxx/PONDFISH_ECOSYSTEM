# Rule: Automatic Git Commit and Push to Main

Whenever any code changes, edits, refactors, feature additions, UI updates, or documentation updates are made in the project workspace, the agent MUST perform a `git commit` and `git push` to the `main` branch upon completion of the task.

## Workflow Rules:
1. Check `git status` to identify modified, added, or untracked project files.
2. Stage all relevant modified/created files (`git add .` or target specific files).
3. Commit the changes with a clear, professional commit message summarizing the work completed.
4. Push the changes directly to `main` using `git push origin main`.
