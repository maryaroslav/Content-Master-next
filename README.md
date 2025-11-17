# 🛠️ Technology Stack

**Frontend**:
- Next + TS (App Router)
- React
- NextAuth (JWT)
- Redux
- CSS
- Git LFS

**Backend**:
- Express + TS
- MySQL
- JWT (auth)
- CORS
- Sequelize

**Infrastructure**:
- .env.local(frontend)
- .env(backend)
- REST API

# 🛠️ Installation and startup
## Set dependencies:

**frontend**
```
cd frontend
npm install
```
**backend**
```
cd backend
npm install
```

## Customize the .env files:

**backend/.env**
```
DB_NAME=
DB_USER=
DB_PASS=
DB_HOST=
NEXTAUTH_URL=http://localhost:3000/login
JWT_SECRET=a-string-secret-at-least-256-bits-long
```

**frontend/.env.local**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=a-string-secret-at-least-256-bits-long
```

## Start the project:
**backend**
```
cd backend
npm run dev
```
**frontend**
```
cd frontend
npm run dev
```
