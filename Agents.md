# Agents.md

This file contains the general rules for AI agents and developers working on this repository.
For sub-project specific rules:

- Backend: [backend/Agents.backend.md](backend/Agents.backend.md)
- Web application: [webapp/Agents.webapp.md](webapp/Agents.webapp.md)

## Project Structure

| Folder     | Description                                        |
|------------|----------------------------------------------------|
| `backend/` | ASP.NET Core (.NET 10) Minimal API                 |
| `webapp/`  | React + TypeScript web application (with webpack)  |

Before starting any work, read the Agents file of the relevant sub-project.

## Github Repository and Github Project

- Github Repository: [https://github.com/eyEminYILDIZ/ai-sdlc-todoapp](https://github.com/eyEminYILDIZ/ai-sdlc-todoapp)
- Github Project: [https://github.com/users/eyEminYILDIZ/projects/2](https://github.com/users/eyEminYILDIZ/projects/2)

## General Rules

- Stay within the scope of the requested work; do not make unrequested refactors, renames or formatting changes.
- Follow the existing code style, naming and folder structure.
- Before adding a new dependency, evaluate whether the problem can be solved with the existing ones.
- Never put secrets, passwords, tokens or connection strings in code or commits.
- After making changes, build / typecheck the relevant project (commands are in the sub-project files).
- Code comments and commit messages are in English; replies to the user are given in the user's language.

## Git Rules

- Main branch: `main`. Do not work directly on `main`; open a separate branch for each task.
- Branch names: `feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`.
- Commit messages are short, in the imperative mood and in English (e.g. `Add todo creation endpoint`). The first line should not exceed ~72 characters.
- Each commit contains a single logical change; do not put unrelated changes in the same commit.
- Do not commit, push or open a PR unless the user explicitly asks.
- Do not run irreversible commands such as `git push --force`, `git reset --hard`, `git clean -fd` without approval.
- Skipping hooks (`--no-verify`) and rewriting history (`rebase`, `amend`) are only done on explicit instruction.
- Add files one by one instead of `git add .`; `node_modules/`, `bin/`, `obj/`, `dist/` and `.env` files must not be committed.
- Before committing, check what is being committed with `git status` and `git diff`.

## Pull Request

- The PR title follows the commit message rules.
- The description states what changed, why it changed and how it was tested.
- Keep PRs small and single-purpose.

## API Contract

- The contract between backend and webapp is JSON; field names are camelCase (`id`, `text`, `done`).
- If a field changes in the backend model, the TypeScript type under `webapp/src/models` must be updated in the same change.
- When endpoints change, the `backend/webapi.http` file must be updated as well.
