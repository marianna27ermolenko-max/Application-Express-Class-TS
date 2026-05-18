# Blogs API

REST API для блоговой платформы на Node.js + TypeScript + Express + MongoDB.

## Стек

* Node.js
* TypeScript
* Express
* MongoDB
* Mongoose
* JWT Authentication
* Bcrypt
* Express-validator
* Nodemon
* Jest / Supertest

---

# Возможности

## Auth

* Регистрация пользователя
* Логин
* JWT access token
* Refresh token
* Logout
* Email confirmation
* Password recovery

## Users

* Создание пользователя через admin
* Получение списка пользователей
* Удаление пользователя

## Blogs

* CRUD операции для блогов
* Pagination
* Sorting

## Posts

* CRUD операции для постов
* Получение постов блога

## Comments

* Создание комментариев
* Обновление комментариев
* Удаление комментариев
* Like / Dislike comments

## Likes

* Like
* Dislike
* None status
* Пересчёт likes/dislikes count

---

# Архитектура

Проект построен по слоям:

```text
src/
 ├── auth/
 ├── users/
 ├── blogs/
 ├── posts/
 ├── comments/
 ├── common/
 ├── db/
 └── setup-app.ts
```

Каждый модуль содержит:

```text
api/
domain/
infrastructure/
application/
```

## Слои

### API

* controllers
* routers
* validators
* middlewares

### Domain

* бизнес логика
* entities
* services

### Infrastructure

* repositories
* mongoose models
* database logic

### Application

* use-cases
* CQRS handlers

---

# Установка

## 1. Clone repository

```bash
git clone <repo-url>
```

## 2. Install dependencies

```bash
pnpm install
```

или

```bash
npm install
```

---

# Environment variables

Создай `.env` файл:

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/blogs
JWT_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=10m
REFRESH_TOKEN_EXPIRES_IN=20m
```

---

# Run project

## Development

```bash
pnpm dev
```

или

```bash
npm run dev
```

## Build

```bash
pnpm build
```

## Production

```bash
pnpm start
```

---

# Scripts

```json
{
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "test": "jest"
}
```

---

# Authentication

Используется JWT авторизация.

## Access Token

Передаётся в headers:

```http
Authorization: Bearer <token>
```

## Refresh Token

Хранится в httpOnly cookies.

---

# Validation

Валидация реализована через `express-validator`.

Пример:

```ts
body('likeStatus')
  .exists()
  .withMessage('Like status is required')
  .isIn(['Like', 'Dislike', 'None'])
  .withMessage('Invalid like status')
```

---

# Database

Используется MongoDB + Mongoose.

## Пример структуры User

```ts
{
  accountData: {
    login,
    email,
    passwordHash,
    createdAt
  },

  emailConfirmation: {
    confirmationCode,
    expirationDate,
    isConfirmed
  },

  recoveryCode: {
    confirmationCode,
    expirationDate
  }
}
```

---

# Pagination

Поддерживается:

* pageNumber
* pageSize
* sortBy
* sortDirection

Пример:

```http
GET /posts?pageNumber=1&pageSize=10&sortBy=createdAt&sortDirection=desc
```

---

# Testing

Тесты написаны с использованием:

* Jest
* Supertest

Запуск:

```bash
pnpm test
```

---

# API Endpoints

## Auth

```http
POST /auth/login
POST /auth/registration
POST /auth/refresh-token
POST /auth/logout
POST /auth/registration-confirmation
```

## Users

```http
GET /users
POST /users
DELETE /users/:id
```

## Blogs

```http
GET /blogs
POST /blogs
PUT /blogs/:id
DELETE /blogs/:id
```

## Posts

```http
GET /posts
POST /posts
PUT /posts/:id
DELETE /posts/:id
```

## Comments

```http
POST /posts/:postId/comments
PUT /comments/:id
DELETE /comments/:id
PUT /comments/:id/like-status
```

---

# Особенности проекта

* Layered architecture
* DTO pattern
* Repository pattern
* Domain entities
* Error handling
* JWT auth
* MongoDB indexes
* Pagination & sorting
* Like system

---

# Author

Backend educational project built with Node.js + TypeScript.
