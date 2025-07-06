# Tic-Tac-Toe Versus - Deployment Guide

This guide will help you deploy your tic-tac-toe application to various platforms.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended for production)
- Git repository

## Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

### Step 1: Deploy Backend to Railway

1. **Sign up for Railway** at [railway.app](https://railway.app)

2. **Connect your GitHub repository**

3. **Create a new project** and select your repository

4. **Set up environment variables**:

   - `MONGODB_URI`: Your MongoDB connection string
   - `CLIENT_URL`: Your frontend URL (will be set after deploying frontend)
   - `PORT`: 5000 (or leave default)

5. **Deploy the server directory**:

   - Railway will automatically detect the Node.js app
   - The `Procfile` and `package.json` are already configured

6. **Get your backend URL** (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Sign up for Vercel** at [vercel.com](https://vercel.com)

2. **Import your GitHub repository**

3. **Configure the project**:

   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set environment variables**:

   - `VITE_API_URL`: Your Railway backend URL (e.g., `https://your-app.railway.app`)

5. **Deploy**

6. **Update your backend's `CLIENT_URL`** environment variable with your Vercel frontend URL

## Option 2: Render (Full Stack)

### Step 1: Deploy to Render

1. **Sign up for Render** at [render.com](https://render.com)

2. **Create a new Web Service**

3. **Connect your GitHub repository**

4. **Configure the service**:

   - **Name**: `tic-tac-toe-versus`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: Leave empty (deploy from root)

5. **Set environment variables**:

   - `MONGODB_URI`: Your MongoDB connection string
   - `CLIENT_URL`: Your frontend URL (will be set after deploying frontend)

6. **Deploy**

### Step 2: Deploy Frontend to Render

1. **Create a new Static Site**

2. **Configure**:

   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

3. **Set environment variables**:

   - `VITE_API_URL`: Your backend Render URL

4. **Deploy**

## Option 3: Netlify (Frontend) + Heroku (Backend)

### Step 1: Deploy Backend to Heroku

1. **Install Heroku CLI** and sign up at [heroku.com](https://heroku.com)

2. **Create a new Heroku app**:

   ```bash
   heroku create your-tic-tac-toe-backend
   ```

3. **Set environment variables**:

   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set CLIENT_URL=your_frontend_url
   ```

4. **Deploy**:
   ```bash
   git subtree push --prefix server heroku main
   ```

### Step 2: Deploy Frontend to Netlify

1. **Sign up for Netlify** at [netlify.com](https://netlify.com)

2. **Import your GitHub repository**

3. **Configure build settings**:

   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

4. **Set environment variables**:

   - `VITE_API_URL`: Your Heroku backend URL

5. **Deploy**

## Option 4: Docker + Any Cloud Provider

### Step 1: Create Dockerfile for Backend

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Step 2: Create Dockerfile for Frontend

Create `client/Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 3: Create docker-compose.yml

```yaml
version: "3.8"
services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - CLIENT_URL=${CLIENT_URL}
    depends_on:
      - mongodb

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/tic-tac-toe
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5001
```

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended for production)

1. **Sign up** at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create a cluster** (free tier available)
3. **Get your connection string**
4. **Set up network access** (allow all IPs for development)
5. **Create a database user**

### Option 2: Local MongoDB

```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
sudo apt-get install mongodb   # Ubuntu

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongodb          # Ubuntu
```

## Testing Your Deployment

1. **Test the backend**:

   ```bash
   curl https://your-backend-url.com/api/sessions
   ```

2. **Test the frontend**:
   - Visit your frontend URL
   - Create a new game
   - Share the link with a friend
   - Test the game functionality

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure your backend has CORS configured properly
2. **Environment variables**: Double-check all environment variables are set correctly
3. **MongoDB connection**: Verify your MongoDB URI is correct and accessible
4. **Build errors**: Check that all dependencies are properly installed

### Debug Commands

```bash
# Check backend logs
heroku logs --tail  # Heroku
railway logs        # Railway
render logs         # Render

# Check frontend build
npm run build       # Test build locally
```

## Security Considerations

1. **Use HTTPS** in production
2. **Set up proper CORS** configuration
3. **Use environment variables** for sensitive data
4. **Consider rate limiting** for API endpoints
5. **Validate user input** on both frontend and backend

## Performance Optimization

1. **Enable compression** on your web server
2. **Use CDN** for static assets
3. **Implement caching** strategies
4. **Optimize database queries**
5. **Use connection pooling** for MongoDB

## Monitoring

1. **Set up logging** for both frontend and backend
2. **Monitor API response times**
3. **Track error rates**
4. **Set up alerts** for downtime
5. **Monitor database performance**

---

Choose the deployment option that best fits your needs. For beginners, I recommend **Option 1 (Vercel + Railway)** as it's the easiest to set up and maintain.
