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
