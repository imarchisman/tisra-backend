# Tisra Backend - AI-First Music Collaboration

Tisra is a real-time collaborative music platform that integrates with Spotify to bring friends together in virtual rooms for synchronized listening and chat.

## 🚀 Features

- **Authentication:** Secure JWT-based registration and login, with Google OAuth support.
- **User Profiles:** Personalized profiles with display names and avatars.
- **Spotify Integration:** Full search and playback synchronization for track metadata.
- **Rooms:** Create, join, and manage collaborative listening rooms.
- **Real-time Sync:** Socket.IO powered playback synchronization (Play/Pause/Seek) and chat.
- **Playlists:** Comprehensive personal playlist management with track collection.
- **Strict Typing:** 100% TypeScript compliance with no `any` types for maximum maintainability.

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (with Prisma ORM)
- **Real-time:** Socket.IO
- **Validation:** Joi
- **Testing:** Jest + Supertest
- **Linting:** ESLint + Prettier

## 📦 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tisra-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your `DATABASE_URL`, `JWT_SECRET`, and `SPOTIFY_CLIENT_ID/SECRET`.

4. **Database Migration:**
   ```bash
   npx prisma migrate dev
   ```

5. **Run Locally:**
   ```bash
   npm run dev
   ```

## 🧪 Testing

Run the full integration test suite:
```bash
npm run test
```

## 📜 Coding Standards

- **Strict TypeScript:** No `any` types permitted.
- **Conventional Commits:** Standardized commit messages.
- **Layered Architecture:** Routes -> Controllers -> Services -> Repositories.
