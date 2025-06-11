# 📖 Jurnl

A digital journaling web application where users can create personalized journal entries, organize their thoughts, and express themselves through customizable text and images. ✨

## 🌟 About Jurnl

Jurnl is designed to bring the personal touch of traditional journaling to the digital world. Users can create multiple journals, write entries with custom fonts and styles, add images, and organize their memories by date. Whether you're documenting daily thoughts, tracking personal growth, or creating a digital scrapbook, Jurnl provides a simple yet flexible platform for self-expression. 💭

### 🚀 Features

- **📚 Multiple Journals**: Create and manage different journals for various aspects of your life
- **✍️ Rich Text Entries**: Write with customizable fonts, text styles, and formatting
- **🖼️ Image Support**: Add photos and images to bring your entries to life
- **📅 Calendar View**: Navigate through your entries by date
- **🔒 Privacy Options**: Keep journals private or share selected entries
- **👥 Friends System**: Connect with friends and share your journey (coming soon)
- **🎨 Customization**: Personalize the look and feel of your journals

## 🛠️ Tech Stack

- **⚡ Frontend**: SvelteKit with TypeScript - for a fast, reactive user interface
- **🗄️ Database**: MongoDB - for flexible document storage
- **💅 Styling**: SCSS - for maintainable stylesheets
- **🔐 Authentication**: Google OAuth - for secure user accounts
- **🚀 Development**: In-memory MongoDB for zero-config local development

## 🏁 Getting Started

### 📋 Prerequisites

- Node.js (v16 or higher) 🟢
- npm 📦

### ⚡ Quick Start

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

4. Open http://localhost:3000 in your browser 🌐

That's it! 🎉 The app uses an in-memory database for development, so there's no database setup required.

### 💻 Development Commands

```bash
npm run dev        # 🚀 Start development server
npm run build      # 📦 Build for production
npm run preview    # 👀 Preview production build
npm run lint       # 🔍 Run linting
npm run format     # ✨ Format code with Prettier
npm run check      # 🔧 Type checking
npm run test       # 🧪 Run tests
```

## 🐛 Debug Panel

Jurnl includes a developer debug panel at `/debug` that allows you to:

- 🧪 Test all API routes directly
- 🔍 Check authentication states
- 💾 Verify database operations
- 👥 Test the friends system
- 📊 Inspect API responses

This is particularly useful for backend development and API testing without going through the UI.

## 📁 Project Structure

```
src/
├── routes/          # 📄 SvelteKit pages and API routes
├── lib/
│   ├── components/  # 🧩 Reusable UI components
│   ├── server/      # ⚙️ Server-side logic
│   │   ├── api/     # 🌐 API services
│   │   ├── auth/    # 🔐 Authentication
│   │   └── database/# 🗄️ Database configuration
│   └── types/       # 📝 TypeScript type definitions
└── styles/          # 🎨 SCSS stylesheets
```

## 🌍 Environment Variables

For basic development, no configuration is needed! ✅ For production or custom setups:

- `MONGODB_URI` = mongodb://root:example@localhost:27017/ - MongoDB connection string (optional in dev)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` OAuth variables for Google login (optional)

## 🔧 Setting Up OAuth

1. Login to the [Google Auth Console](https://console.cloud.google.com/auth). 🌐
2. Select 'create project' and give it a name. 📝

<img width="725" alt="Screenshot 2025-06-11 at 10 27 18 AM" src="https://github.com/user-attachments/assets/ac654449-196a-4a1c-89be-f56929f456f7" width="200" height="300"/>

```
 Name: Jurnl
```

3. Click on clients and then 'get started'. 🚀

<img width="725" alt="Screenshot 2025-06-11 at 10 28 56 AM" src="https://github.com/user-attachments/assets/aa30fa4c-cc1b-4a49-baeb-a04d3f48520b" width="200" height="350"/>

4. Setup project configurations. ⚙️

<img width="725" alt="Screenshot 2025-06-11 at 10 29 49 AM" src="https://github.com/user-attachments/assets/4478291b-87b1-4080-85fc-0c94d27eb434" width="200" height="400"/>

```
 App name: Jurnl
 User support email: <your-email>
 Audience: External
```

5. Click 'create oauth client'. 🔑

<img width="725" alt="Screenshot 2025-06-11 at 10 30 41 AM" src="https://github.com/user-attachments/assets/15b81462-b311-4b8f-8942-5ae4826222bf" width="300" height="400"/>

```
 Application Type: Web Application
 Name: Jurnl
 Authorized JavaScript origins: http://localhost:3000
 Authorized redirect URIs:
  http://localhost:3000/profile
  http://localhost:3000/journals
  http://localhost:3000/auth/login/google/callback
```
6. Save and copy client ID and secret to .env 💾

## 📚 Resources
All resources are commented in the code directly. Here are a list of general resources used throughout the entire project:
1. 🌐 [w3schools.com](https://www.w3schools.com/)
2. ⚡ [Svelte Docs](https://svelte.dev/docs)
3. 🧪 [Vitest](https://vitest.dev/api/)
4. 🔐 [Google OAuth Client Docs](https://support.google.com/cloud/answer/15549257?hl=en)
5. 🎨 [Figma](https://www.figma.com/?&utm_source=google&utm_medium=cpc&utm_campaign=21284800681&utm_term=figma&utm_content=699203569595&utm_adgroup=169015407344&gad_source=1&gad_campaignid=21284800681&gbraid=0AAAAACTf0kM1lGeTUv4OY91iDwH8fVyzL&gclid=Cj0KCQjw0qTCBhCmARIsAAj8C4YJZOf2Ll8Aic7t_SIF2rhSPwGGVtwQyxKBtvjnBTOzcFS8wLMKEW8aApAlEALw_wcB&gclsrc=aw.ds)
6. ✨ [Prettier Formatting](https://prettier.io/)
7. 🐳 [Docker](https://medium.com/@kerrache.massipssa/basic-dockerfile-commands-a6757872d375)

## 📄 License

Copyright 2025 "The Jurnlers LLC." 🏢

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. ⚖️