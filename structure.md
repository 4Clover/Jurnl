🔍 ScribblyScraps Project Structure Analysis
===========================================
Generated: Tue Jun  3 16:30:03 PDT 2025

📁 PROJECT ROOT: /mnt/e/JetBrainsProjects/FinalProject-162

## 📂 SOURCE STRUCTURE

### src/ Directory
```
src
- assets
- lib
- - components
- - - buttons
- - - entry
- - - friends
- - - journal
- - - landing
- - - nav
- - server
- - - api
- - - auth
- - - database
- - - - schemas
- - types
- routes
- - api
- - - [...path]
- - auth
- - - google
- - - - callback
- - - login
- - - login-dillon
- - - - login
- - - - register
- - - logout
- - - register
- - debug
- - feed
- - - [friend]
- - journals
- - - [journal]
- - - - entries
- - - create
- - landing
- - profile
- styles
```

## 🛣️ ROUTES DETAIL

### Routes Structure
```
- routes
- - api
- - - [...path]
- - auth
- - - google
- - - - callback
- - - login
- - - login-dillon
- - - - login
- - - - register
- - - logout
- - - register
- - debug
- - feed
- - - [friend]
- - journals
- - - [journal]
- - - - entries
- - - - - [entry]
- - - create
- - landing
- - profile
```

## 🌐 API ROUTES
```
src/routes/api/[...path]/+server.ts
```

## 📚 LIBRARY STRUCTURE

### lib/ Directory
```
- lib
- - components
- - - buttons
- - - entry
- - - friends
- - - journal
- - - landing
- - - nav
- - server
- - - api
- - - auth
- - - database
- - - - schemas
- - types
```

## 🗄️ DATABASE SCHEMAS
```
src/lib/server/database/schemas/entry.schema.ts
src/lib/server/database/schemas/index.ts
src/lib/server/database/schemas/journal.schema.ts
src/lib/server/database/schemas/session.schema.ts
src/lib/server/database/schemas/user.schema.ts
```

## 📋 KEY FILES CHECK

| File | Status | Path |
|------|--------|------|
| Package.json | ✅ Found | `package.json` |
| Svelte Config | ✅ Found | `svelte.config.js` |
| Vite Config | ✅ Found | `vite.config.ts` |
| TypeScript Config | ✅ Found | `tsconfig.json` |
| Docker Compose | ✅ Found | `docker-compose.yml` |
| Environment Variables | ✅ Found | `.env` |
| Env Example | ✅ Found | `.env.example` |
| App HTML | ✅ Found | `src/app.html` |
| App Types | ✅ Found | `src/app.d.ts` |
| Server Hooks | ✅ Found | `src/hooks.server.ts` |
| Client Hooks | ❌ Missing | `src/hooks.client.ts` |

## 🔐 AUTH FILES

```
src/lib/server/auth/sessionManager.ts
src/lib/server/database/schemas/session.schema.ts
```

## 🎨 COMPONENTS
```
src/lib/components/buttons/LogInOutButton.svelte
src/lib/components/buttons/PrimaryButton.svelte
src/lib/components/buttons/SecondaryButton.svelte
src/lib/components/buttons/SidebarToggle.svelte
src/lib/components/entry/EntryView.svelte
src/lib/components/entry/TemplateEntryForm.svelte
src/lib/components/friends/Feed.svelte
src/lib/components/friends/FeedItem.svelte
src/lib/components/journal/EntrySidebar.svelte
src/lib/components/journal/EntrySidebarItem.svelte
src/lib/components/journal/JournalCover.svelte
src/lib/components/journal/JournalMenu.svelte
src/lib/components/landing/UserCloseFriends.svelte
src/lib/components/landing/UserJournal.svelte
src/lib/components/landing/UserJournals.svelte
src/lib/components/landing/UserProfile.svelte
src/lib/components/landing/UserPublicEntries.svelte
src/lib/components/nav/InitialUserNav.svelte
src/lib/components/nav/NormalNav.svelte
```

## 🖼️ STATIC ASSETS
```
drwxrwxrwx 1 dillon dillon   4096 Jun  2 18:36 .
drwxrwxrwx 1 dillon dillon   4096 Jun  3 16:30 ..
-rwxrwxrwx 1 dillon dillon   1571 May 19 19:47 favicon.png
-rwxrwxrwx 1 dillon dillon   9772 Jun  2 18:36 google-logo.svg.webp
-rwxrwxrwx 1 dillon dillon 359344 Jun  2 18:36 logo.png
```

## 📦 PACKAGE.JSON SUMMARY
```json
    "name": "jurnl-app",
    "version": "0.0.1",
    "type": "module",
```

## 🔑 ENVIRONMENT VARIABLES
```
BASE_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
MONGO_INITDB_ROOT_PASSWORD: example
MONGO_INITDB_ROOT_USERNAME: root
PUBLIC_SOME_FEATURE_FLAG
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
```

## 📊 GIT STATUS
```
 M .env.example
 M .gitignore
 M .prettierignore
 M .prettierrc
 M .vscode/extensions.json
 M README.md
 M README/LUCIA_EXPLAINED.md
 M README/MONGODB_EXPLAINED.md
 M docker-compose.yml
 M eslint.config.js
 M package-lock.json
 M package.json
AM show-project-structure.sh
 M src/app.css
 M src/app.html
 M src/hooks.server.ts
 M src/lib/components/buttons/LogInOutButton.svelte
 M src/lib/components/buttons/PrimaryButton.svelte
 M src/lib/components/entry/EntryView.svelte
 M src/lib/components/entry/TemplateEntryForm.svelte
... and 65 more files
```

## 🐳 DOCKER STATUS
```
NAMES                STATUS                  PORTS
```

## 🚨 RECENT ERRORS (if any)
```
No error logs found
```

## 📈 SUMMARY

- Total Routes: 14
- Total API Routes: 1
- Total Components: 34
- Total TypeScript Files: 33
- Total Schemas: 5

Generated by show-project-structure.sh
