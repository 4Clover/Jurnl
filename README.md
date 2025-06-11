# Jurnl

A digital journaling web application where users can create personalized journal entries, organize their thoughts, and express themselves through customizable text and images.

## About Jurnl

Jurnl is designed to bring the personal touch of traditional journaling to the digital world. Users can create multiple journals, write entries with custom fonts and styles, add images, and organize their memories by date. Whether you're documenting daily thoughts, tracking personal growth, or creating a digital scrapbook, Jurnl provides a simple yet flexible platform for self-expression.

### Features

- **Multiple Journals**: Create and manage different journals for various aspects of your life
- **Rich Text Entries**: Write with customizable fonts, text styles, and formatting
- **Image Support**: Add photos and images to bring your entries to life
- **Calendar View**: Navigate through your entries by date
- **Privacy Options**: Keep journals private or share selected entries
- **Friends System**: Connect with friends and share your journey (coming soon)
- **Customization**: Personalize the look and feel of your journals

## Tech Stack

- **Frontend**: SvelteKit with TypeScript - for a fast, reactive user interface
- **Database**: MongoDB - for flexible document storage
- **Styling**: SCSS - for maintainable stylesheets
- **Authentication**: Session-based auth - for secure user accounts
- **Development**: In-memory MongoDB for zero-config local development

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Quick Start

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/jurnl.git
    cd jurnl
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open http://localhost:3000 in your browser

That's it! The app uses an in-memory database for development, so there's no database setup required.

### Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run linting
npm run format     # Format code with Prettier
npm run check      # Type checking
npm run test       # Run tests
```

## Debug Panel

Jurnl includes a developer debug panel at `/debug` that allows you to:

- Test all API routes directly
- Check authentication states
- Verify database operations
- Test the friends system
- Inspect API responses

This is particularly useful for backend development and API testing without going through the UI.

## Project Structure

```
src/
├── routes/          # SvelteKit pages and API routes
├── lib/
│   ├── components/  # Reusable UI components
│   ├── server/      # Server-side logic
│   │   ├── api/     # API services
│   │   ├── auth/    # Authentication
│   │   └── database/# Database configuration
│   └── types/       # TypeScript type definitions
└── styles/          # SCSS stylesheets
```

## Environment Variables

For basic development, no configuration is needed. For production or custom setups:

- `MONGODB_URI` - MongoDB connection string (optional in dev)
- Additional OAuth variables for Google login (optional)

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Your license here]

## Questions?

Feel free to open an issue or reach out to the team!
