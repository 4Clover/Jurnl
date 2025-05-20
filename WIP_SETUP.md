# Development Environment Setup (WIP)

To ensure a consistent development experience for everyone, please follow these setup instructions.

### Prerequisites

1.  **Git:** [Download Here](https://git-scm.com/downloads)
2.  **Node.js:** Version **22.15.1**: [Download Here](https://nodejs.org/en)
    - The `package.json` includes an `engines` field to help enforce this version with npm.
3.  **npm:** (Comes bundled with Node.js) Ensure you are using the npm version that comes with Node.js 22.15.1.
4.  **Docker (For local MongoDB):** [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/4Clover/ScribblyScraps.git
    cd ScribblyScraps
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    - Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    - Open the newly created `.env` file and fill in the necessary values (see [Environment Variables](#environment-variables) and [MongoDB Setup](#mongodb-setup) sections). **Do not commit your `.env` file.**

4.  **Initialize Husky (for pre-commit hooks):**
    This should happen automatically after `npm install` if Husky is set up correctly. If you encounter issues with pre-commit hooks, you might need to run:
    ```bash
    npx husky install
    ```

### Running the Development Server

Once dependencies are installed and your `.env` file is configured:

```bash
npm run dev
```

This will start the SvelteKit development server, typically available at `http://localhost:5173`.

## MongoDB Setup

You have two options for setting up MongoDB for development:

### Option 1: Cloud Hosted Cluster (CURRENTLY NOT WORKING)

We have a shared MongoDB Atlas cluster for development.

- **Connection URI:** `URI`
- Update the `MONGODB_URI` variable in your `.env` file with this URI.
- _Note: Be mindful when working with shared data. Coordinate with the team if you are performing destructive operations._

### Option 2: Local Docker Instance

For a completely isolated local development environment, you can use Docker.

1.  **Ensure Docker Desktop is running.**
2.  **Start the MongoDB container:**
    ```bash
    docker-compose up -d
    ```
3.  Update the `MONGODB_URI` in your `.env` file to connect to this local instance:
    ```
    MONGODB_URI="mongodb://localhost:27017/<db_name>"
    ```
    - <db_name> can be of your choosing

To stop the local MongoDB container: `docker-compose down`

## Coding Standards & Conventions

### Code Editor

- **Recommended Editor:** Visual Studio Code (VS Code).
- **Recommended Extensions:**
    - A `.vscode/extensions.json` file is included in this repository. VS Code will prompt you to install these recommended extensions when you open the project.
    - Key extensions include: Svelte for VS Code, ESLint, Prettier - Code formatter, Tailwind CSS IntelliSense.
- If you use a different editor, please ensure you have equivalent plugins for Svelte, TypeScript, ESLint, and Prettier.
    - Dillon uses JetBrains products (WebStorm, etc.) so he can help with its specific setup and plugins.

### Formatting & Linting

- **Formatter:** Prettier (configuration in `.prettierrc.json`).
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

We use the GitHub Flow branching strategy.

### Branching Strategy

1.  The `main` branch is our stable, deployable branch. **Direct pushes to `main` are disabled.**
2.  For any new feature, bugfix, or task, create a new branch from the latest `main`.
3.  **Branch Naming Conventions:**
    - Features: `feature/<feature-name>` (e.g., `feature/user-authentication`)
    - Bugfixes: `fix/<issue-description>` (e.g., `fix/calendar-rendering-bug`)
    - Chores/Refactors: `chore/<task-name>` (e.g., `chore/update-dependencies`)
    - Use hyphens (`-`) to separate words in the branch name.
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feature/your-feature-name
    ```

### Committing Changes

- Make small, logical commits.
- Write clear and concise commit messages.
- Pre-commit hooks will automatically format and lint your code. If they fail, fix the issues and try committing again.

### Pull Requests (PRs)

1.  Once your work on a branch is complete, push it to the remote repository:
    ```bash
    git push origin feature/your-feature-name
    ```
2.  Open a Pull Request (PR) on GitHub, targeting the `main` branch.
3.  Provide a clear title and description for your PR, outlining the changes and linking to any relevant issues.
4.  Assign reviewers who are related to the code/feature from the team.
5.  Code review and discussion will take place within the PR or Discord.
6.  Once the PR is approved and any automated checks (CI/CD, if configured) pass, it can be merged into `main`.
7.  After merging, delete the feature branch (GitHub often provides an option to do this automatically).

## Contributing

1.  Pick an issue to work on (or create one) from the [GitHub Issues page](<Link to your GitHub issues>). Assign yourself or comment to claim it.
2.  Follow the [Git Workflow](#git-workflow) to create a branch and make your changes.
3.  Ensure your code adheres to the [Coding Standards & Conventions](#coding-standards--conventions).
4.  Thoroughly test your changes locally.
5.  Open a Pull Request for review.

If you have any questions, ask in Discord!
