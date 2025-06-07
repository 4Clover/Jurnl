# ScribblyScraps - A Digital Journaling & Scrapbooking Platform

Welcome to the ScribblyScraps repository! This project aims to create a rich, interactive web application where users can create and personalize digital journal entries, much like a scrapbook.

## TODO:

1. Vercel docs/deployment information
    - GitHub actions for checks before push to prod
    - Configure env secrets so MongoDB can be used
2. Deal with possible annoying aspects of Prettier and ESlint checks locally and on GitHub
3.

## Table of Contents

1.  [Project Overview](#project-overview)
    - [Key Features (Planned)](#key-features-planned)
2.  [Technology Stack](#technology-stack)
3.  [Development Environment Setup](README/DEV_ENV_SETUP.md)
4.  [Coding Standards & Conventions](#coding-standards--conventions)
    - [Code Editor](#code-editor)
    - [Formatting & Linting](#formatting--linting)
    - [Environment Variables](#environment-variables)
5.  [Git Workflow](#git-workflow)
    - [Branching Strategy](#branching-strategy)
    - [Pull Requests (PRs) & Merging to `main`](#pull-requests-prs--merging-to-main)
    - [Developer Best Practices for this Workflow](#developer-best-practices-for-this-workflow)
6.  [Contributing](#contributing)

## Project Overview

ScribblyScraps is a full-stack web application built with SvelteKit and MongoDB. It allows users to:

- Create text-based journal entries.
- Upload and incorporate photos into entries.
- Access a calendar view to see entries by date.
- Customize entries with different "paper" styles, fonts, and digital "stickers."
- (Future) Share entries with friends or make selected entries public.

### Key Features (Planned)

- User authentication and private journals.
- Rich text editor for journaling.
- Image uploads and embedding.
- Calendar view.
- Customization options (paper, fonts, stickers).
- Drag-and-drop interface for placing elements.
- (Barebones) Friends system, custom paper, multiple fonts, image positioning.
- (Additional) Speech-to-text, prompt of the day, Spotify integration, emoji reactions.
- (Stretch) Uploadable stickers.

## Technology Stack

- **Framework:** [SvelteKit (with TypeScript)](README/SVELTE_KIT_EXPLAINED.md)
- **Database:** [MongoDB](README/MONGODB_EXPLAINED.md)
- **Styling:** Tailwind CSS
- **Authentication:** [Lucia](README/LUCIA_EXPLAINED.md)
- **Build Tool:** Vite (managed by SvelteKit)
- **Package Manager:** npm
- **Version Control:** Git, hosted on GitHub

For detailed instructions on setting up your development environment, please see [DEVELOPMENT_SETUP.md](README/DEV_ENV_SETUP.md).

## Coding Standards & Conventions

### Code Editor

- **Recommended Editor:** Visual Studio Code (VS Code).
- **Recommended Extensions:**
    - A `.vscode/extensions.json` file is included in this repository. VS Code will prompt you to install these recommended extensions when you open the project.
    - Key extensions include: Svelte for VS Code, ESLint, Prettier - Code formatter, Tailwind CSS IntelliSense.
- If you use a different editor, please ensure you have equivalent plugins for Svelte, TypeScript, ESLint, and Prettier.
    - Dillon uses JetBrains products (WebStorm, etc.) so he can help with its specific setup and plugins.

### Formatting & Linting

- **Formatter:** Prettier (configuration in `.prettierrc`).
    - We use the `prettier-plugin-tailwindcss` to automatically sort Tailwind classes.
- **Linter:** ESLint (configuration in `.eslint.config.js`) with Svelte and TypeScript support.

    - VS Code ESLint Extension: Make sure your VS Code ESLint extension is configured to use "flat config" if it doesn't detect it automatically (may not matter in newer versions).
        - In your VS Code settings.json:

    ```json
        "eslint.experimental.useFlatConfig": true,
        "eslint.validate": [
            "javascript",
            "javascriptreact",
            "typescript",
            "typescriptreact",
            "svelte"
        ],
    ```

- **Pre-commit Hooks:** Husky is configured to run Prettier and ESLint on staged files before each commit. This helps maintain code consistency and catch errors early.
    - You can manually run checks:
        ```bash
        npm run lint
        npm run format
        ```

### Environment Variables

**!!! CURRENTLY BEING EDITED !!!**

- All environment-specific configurations (API keys, database URIs, etc.) should be stored in a `.env` file at the project root.
- A `.env.example` file is provided as a template. Copy it to `.env` and fill in your values.
- **The `.env` file is ignored by Git and should never be committed.**
- **SvelteKit Convention:**
    - Variables intended for client-side browser access **must** be prefixed with `PUBLIC_`.
    - Variables without this prefix are only available on the server-side.

## Git Workflow

We use a disciplined Git workflow centered around Pull Requests (PRs) to maintain a clean, stable, and linear history on our `main` branch. **Direct pushes to `main` are disabled.**

### Branching Strategy

1.  The `main` branch is our stable, production-ready branch.
2.  For any new feature, bugfix, or task, create a new branch from the latest `main`.
3.  **Branch Naming Conventions:**
    - Features: `feature/<feature-name>` (e.g., `feature/user-authentication`)
    - Bugfixes: `fix/<issue-description>` (e.g., `fix/calendar-rendering-bug`)
    - Chores/Refactors: `chore/<task-name>` (e.g., `chore/update-dependencies`)
    - Use hyphens (`-`) to separate words in the branch name.

### Pull Requests (PRs) & Merging to `main`

1.  All changes destined for `main` **must** go through a Pull Request.
2.  **Key `main` Branch Protections Enforced by GitHub:**
    - PRs require at least one approval.
    - Stale approvals are dismissed if new commits are pushed to the PR.
    - The most recent push to a PR must be approved by someone other than the author.
    - All review conversations must be resolved.
    - Required status checks (e.g., linting, tests, build from GitHub Actions) must pass.
    - The PR branch must be up-to-date with `main` before merging.
    - **Only Squash Merging is allowed** when merging a PR into `main`. This ensures `main` has a linear history where each commit represents a complete PR.
    - Force pushes to `main` are blocked.

### Developer Best Practices for this Workflow

To make working with this workflow smoother:

1.  **Keep Feature Branches Up-to-Date with `main` using Rebase:**

    - Before starting new work or when wanting to incorporate latest `main` changes into your feature branch, use rebase:
        ```bash
        git checkout main
        git pull origin main
        git checkout your-feature-branch
        git rebase main
        # Resolve any conflicts, then continue: git rebase --continue
        ```
    - This keeps your feature branch history linear on top of `main`.

2.  **Clean Up Local Commits Before Pushing/Updating a PR:**

    - Commit frequently with descriptive messages on your local feature branch.
    - Before pushing to create or update your PR, consider using interactive rebase to squash WIP commits, fixup typos, and reword messages into a set of logical, clean commits for easier review:
        ```bash
        # On your feature branch (assuming 'main' is your base):
        git rebase -i main
        ```
    - While GitHub will perform the final squash into a single commit on `main`, a clean commit history _within the PR itself_ greatly aids the review process.

3.  **Make Small, Focused PRs:**

    - Smaller PRs are easier and faster to review and merge.

4.  **Use Pull Request Templates:**

    - When creating a PR, please fill out the provided template to ensure all necessary information is included for reviewers.

5.  **Pre-commit Hooks:**
    - Our Husky pre-commit hooks will automatically run linters and formatters. Ensure these pass before pushing your commits.

## Contributing

1.  Pick an issue to work on (or create one) from the [GitHub Issues page](https://github.com/4Clover/ScribblyScraps/issues). Assign yourself or comment to claim it.
2.  Follow the [Git Workflow](#git-workflow) to create a branch and make your changes.
3.  Ensure your code adheres to the [Coding Standards & Conventions](#coding-standards--conventions).
4.  Thoroughly test your changes locally.
5.  Open a Pull Request for review.

If you have any questions, ask in Discord!
