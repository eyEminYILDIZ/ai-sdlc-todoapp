---
name: ai-coworker
description: Pick up and advance tasks on this repo's GitHub Project board as an AI coworker. Use when the user runs /ai-coworker or asks whether there is a task to do on GitHub / the project board ("github'a bak, yapilacak task var mi"). Works only on the agent-owned columns (In planning, Ready, In progress, In review) and never touches human-owned columns (Backlog, Planned).
---

# ai-coworker

Work the GitHub Project board of this repo together with humans. Every state change must be mirrored on the board (move the item) so the user can follow progress in the GitHub web UI.

Project name, repository and project URL are in the root `Agents.md`. Read it first, together with the sub-project file (`backend/Agents.backend.md`, `webapp/Agents.webapp.md`) of the area you touch. All work must follow those rules (code style, build/typecheck commands, API contract, `webapi.http` updates, English code comments and commit messages).

Use the `gh` CLI for everything. It is already authenticated. Moving board items needs the `project` token scope (reading needs `read:project`); if `gh` reports a missing scope, ask the user to run `! gh auth refresh -s project`.

## Column ownership

| Column | Owner | Rule |
|---|---|---|
| Backlog | Human | Never touch |
| Planned | Human | Never touch (agent only drops tasks here) |
| In planning | Agent | Write implementation plan |
| Ready | Agent | Start implementation |
| In progress | Agent | Continue implementation |
| In review | Agent | Review the PR |
| Done | - | Agent moves reviewed tasks here |

Match column names case-insensitively (the board option is literally `In planning`). Ignore tasks in any other column. Only tasks that are real issues are handled; if an item has no issue content (draft), skip it and mention in the final report that it should be converted to an issue.

## Setup (every run)

```bash
OWNER=eyEminYILDIZ; NUM=2; REPO=eyEminYILDIZ/ai-sdlc-todoapp
PROJECT_ID=$(gh project view $NUM --owner $OWNER --format json --jq .id)
# status field id + option ids
gh project field-list $NUM --owner $OWNER --format json \
  --jq '.fields[] | select(.name=="Status") | {id, options}'
# items with status, issue number, priority
gh project item-list $NUM --owner $OWNER --limit 100 --format json
```

Move an item to a column:

```bash
gh project item-edit --project-id $PROJECT_ID --id <ITEM_ID> \
  --field-id <STATUS_FIELD_ID> --single-select-option-id <OPTION_ID>
```

Choosing a task inside a column: take the highest `Priority` (P0 > P1 > P2 > unset); ties go to the lowest issue number. Process **one task per step**.

Before starting, sync the local repo so every comparison and new branch is based on the latest code:

1. Make sure the working tree is clean (`git status`). If it is not, stop and ask the user.
2. Make sure you are on `main` (`git branch --show-current`); if not, `git checkout main`.
3. Run `git pull --ff-only` and confirm `main` is up to date with `origin/main`.
   - If `origin` is an SSH remote with no usable key, pull over HTTPS with the `gh` credentials instead, without changing git config: `git -c credential.helper='!gh auth git-credential' pull --ff-only https://github.com/$REPO.git main`. Use the same form for `fetch`/`push`.
4. Only then read the board and start working. Step 1 (review) and step 2 (in progress) check out their feature branches from this synced state.

## Flow

Run the steps in this order. After each step, move on to the next one. If a step finds no task, say so and continue.

### 1. In review: review a task

1. Read the issue (`gh issue view <n> --comments`) and find its linked PR (`gh pr list --search "<n> in:body" --state open` or the PR link in the agent comments).
2. Review the PR: `gh pr diff <pr>`, check it against the implementation plan in the issue, check `Agents.md` rules (API contract, `webapi.http`, scope creep), and verify the build/typecheck for the touched sub-project(s) by checking out the PR branch.
3. Post the review notes as an issue comment prefixed with `🤖 [agent:review]`.
4. Decision:
   - **Complete and correct:** approve the PR with `gh pr review <pr> --approve --body "..."`. If GitHub refuses because the PR author is the same account, post the verdict with `gh pr review <pr> --comment` instead and say so in the issue comment. Then merge with `gh pr merge <pr> --squash --delete-branch`, switch back to `main` and pull. Move the item to **Done** (the PR body contains `Closes #<n>`, so the issue closes on merge).
   - **Incomplete or wrong:** list the missing / faulty parts in the `[agent:review]` comment and move the item to **In progress**. Do not merge. Switch back to `main` (see "Leave the repo on main").

### 2. In progress: continue a task

1. Read the issue and all comments. If an earlier `[agent:progress]` comment exists, continue from where it stopped. If a `[agent:review]` comment listed problems, fix them first. If work never started, follow the implementation plan (`[agent:plan]` comment or issue body).
2. Work on the feature branch of the task (see step 3 for naming); check it out if it exists.
3. Finish the implementation, run build/typecheck, then go to the **handoff** below.
4. If you cannot finish (blocked, unclear requirement), commit and push the work done so far on the feature branch, leave an `🤖 [agent:progress]` comment saying what is done, what is left and what blocks you, keep the task in In progress, and switch back to `main` (see "Leave the repo on main"). Never leave uncommitted changes behind.

### 3. Ready: start a task

1. Move the item to **In progress** right away.
2. Create the branch from an up-to-date `main`: `feature/<issue-no>-<short-description>` (use `fix/` or `chore/` when it fits better).
3. Follow the implementation plan in the issue. If there is no plan, write a short one as an `[agent:plan]` comment first, then continue.
4. Implement, build/typecheck, then do the **handoff** below.

A task taken from Ready continues through the following columns in the same run: after the handoff it sits in In review, so run step 1 on it right away (review with a fresh eye, strictly from the diff against the plan).

### 4. In planning: write the implementation plan

1. Read the issue title, body and all comments (human comments may ask for corrections to an earlier plan; address them).
2. Read the code and `Agents.md` files so the plan matches the repo.
3. Post the plan as a `🤖 [agent:plan]` comment. Include: summary, files to change/create (backend, webapp, `webapi.http`, TS models), step-by-step tasks, API contract changes, how to test/verify, open questions.
4. Move the item to **Planned**. Humans decide whether it goes back to In planning or to Ready.

## Handoff (In progress -> In review)

1. Run the build/typecheck commands from the sub-project Agents files for everything you touched.
2. Commit with short, imperative, English messages, one logical change per commit. Add files one by one (no `git add .`), check `git status` / `git diff` first. Use the commit attribution given by the harness.
3. `git push -u origin <branch>`.
4. Open the PR: `gh pr create --base main --title "<commit-style title>" --body "..."`. Body: what changed, why, how it was tested, and `Closes #<n>`.
5. Post an `🤖 [agent:progress]` comment on the issue with the PR link and a summary of what was done.
6. Move the item to **In review**.
7. Switch back to `main` (see "Leave the repo on main").

## Leave the repo on main

This repo lives on a developer's machine, so never leave it on a feature branch. Whenever a step ends, whatever the outcome (handed off, merged, sent back, blocked), run `git checkout main` (and `git pull --ff-only` after a merge) before moving to the next step. The run must end with the working tree clean and `main` checked out. Check the branch and `git status` one last time before the final report; if a step needs a feature branch again, it checks it out itself.

## Hard rules

- Never touch Backlog or Planned items (except dropping a planned task into Planned from In planning).
- Never work directly on `main`; never `push --force`, `reset --hard`, `clean -fd`, `--no-verify`, amend or rebase.
- The "no commit/push/PR unless asked" rule in `Agents.md` does not apply here: this skill is the explicit request for the branch, commit, push, PR and merge steps described above, and only for them.
- Stay inside the scope of the issue. No unrelated refactors.
- No secrets in code, comments or commits.
- Write issue comments in the language of the issue; code comments and commit messages stay English.
- Mirror every state change on the board before moving on, so the web UI is always current.

## Final report

Reply in the user's language with a short summary: for each of the four steps, which task (issue #, title) was handled and which column it moved from/to, PR links, and anything skipped or blocked (including draft items that should become issues). If nothing was found in any agent column, say that plainly and list the task counts per column.
