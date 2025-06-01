# Environment Setup Guide

## 🚨 CRITICAL: You need to create environment files manually

### 1. Frontend Environment Variables
Create a `.env` file in the **root directory** (same level as package.json):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 2. Backend Environment Variables  
Create a `.env` file in the **server/** directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jellycat-support

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP) - Optional for testing
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Client URLs for CORS
CLIENT_URL=http://localhost:5173
```

### 3. Start the application

1. **Start MongoDB** (make sure it's running on localhost:27017)

2. **Start Backend:**
   ```bash
   cd server
   npm install
   npm start
   ```

3. **Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

### 4. Seed the database (first time only)
   ```bash
   cd server
   node seedArticles.js
   ```

## ✅ The fixes applied should resolve:
- ❌ "Cannot access 'initializeChat' before initialization"
- ❌ "showNotificationToast is not defined" 
- ❌ Chat/notification conflicts
- ❌ Socket event overlaps

After creating these .env files, the application should work properly! 