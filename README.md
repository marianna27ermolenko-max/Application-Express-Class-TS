# Blogs API

Blogs API — backend REST API для блоговой платформы.

Проект разработан на Node.js + TypeScript с использованием слоистой архитектуры и MongoDB.

---

## 🚀 Tech Stack

- Node.js
- TypeScript
- Express
- MongoDB
- Mongoose
- JWT (access + refresh tokens)
- Bcrypt
- Express-validator
- Jest
- Supertest

---

## ✨ Features

### Authentication
- User registration
- Login
- JWT access & refresh tokens
- Logout
- Email confirmation
- Password recovery

### Users
- Create user (admin)
- Get users list
- Delete user

### Blogs
- CRUD operations
- Pagination
- Sorting

### Posts
- CRUD operations
- Get posts by blog

### Comments
- Create / update / delete comments
- Like / Dislike system

### Likes
- Like / Dislike / None status
- Likes counter recalculation

---

## 🧱 Architecture

The project follows layered architecture:


src/
├── auth/
├── users/
├── blogs/
├── posts/
├── comments/
├── common/
├── db/
└── setup-app.ts


Each module contains:


api/
domain/
application/
infrastructure/


---

## ⚙️ Installation

```bash
git clone <repo-url>
pnpm install

or

npm install
🔐 Environment Variables

Create .env file:

PORT=5000
MONGO_URL=mongodb://localhost:27017/blogs
JWT_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=10m
REFRESH_TOKEN_EXPIRES_IN=20m
▶️ Running the project
Development
pnpm dev
Build
pnpm build
Production
pnpm start
🧪 Testing
pnpm test
📌 API Endpoints
Auth
POST /auth/login
POST /auth/registration
POST /auth/refresh-token
POST /auth/logout
Users
GET /users
POST /users
DELETE /users/:id
Blogs
GET /blogs
POST /blogs
PUT /blogs/:id
DELETE /blogs/:id
Posts
GET /posts
POST /posts
PUT /posts/:id
DELETE /posts/:id
Comments
POST /posts/:postId/comments
PUT /comments/:id
DELETE /comments/:id
PUT /comments/:id/like-status
📊 Highlights
Layered architecture (API / Domain / Application / Infrastructure)
JWT authentication system
Email confirmation & password recovery
Pagination & sorting
Like system implementation
Unit & integration testing
👩‍💻 Author

Backend educational project built with Node.js + TypeScript.

