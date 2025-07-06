# Tic-Tac-Toe Versus - MERN Stack

A real-time multiplayer tic-tac-toe game built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- 🎮 Create and join game sessions
- 🔗 Shareable session links
- 👥 Real-time multiplayer gameplay
- 📱 Responsive design
- 🔄 Game reset functionality
- 👤 Participant tracking

## How It Works

1. **Create Session**: User clicks "Create Session" and gets a unique session ID
2. **Share Link**: The app generates a shareable URL like `https://yourapp.com/session/abc123`
3. **Join Session**: Others can visit the link and join the session
4. **Real-time Play**: All participants can see the game state and make moves in real-time

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Real-time Updates**: Polling (can be upgraded to WebSockets)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tic-tac-toe-versus
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Create a database named `tic-tac-toe`

#### Option B: MongoDB Atlas

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Get your connection string

### 4. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/tic-tac-toe
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tic-tac-toe
CLIENT_URL=http://localhost:5173
PORT=5000
```

### 5. Start the Application

#### Terminal 1 - Start the Server

```bash
cd server
npm run dev
```

#### Terminal 2 - Start the Client

```bash
cd client
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## API Endpoints

### Sessions

- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:sessionId` - Get session details
- `POST /api/sessions/:sessionId/join` - Join a session
- `POST /api/sessions/:sessionId/move` - Make a move
- `POST /api/sessions/:sessionId/reset` - Reset the game

## Project Structure

```
tic-tac-toe-versus/
├── client/                 # React frontend
│   ├── src/
│   │   ├── Components/     # React components
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   ├── package.json
│   └── .env               # Environment variables
└── README.md
```

## Development

### Adding New Features

1. **Backend**: Add new routes in `server/index.js`
2. **Frontend**: Create new components in `client/src/Components/`
3. **Database**: Update the Mongoose schema in `server/index.js`

### Real-time Updates

Currently, the app uses polling (2-second intervals) for real-time updates. For better performance, consider implementing WebSockets using Socket.io.

### Styling

The app uses CSS modules and inline styles. Consider adding a CSS framework like Tailwind CSS for better styling.

## Deployment

### Frontend (Vercel/Netlify)

1. Build the client: `cd client && npm run build`
2. Deploy the `dist` folder

### Backend (Heroku/Railway)

1. Set environment variables
2. Deploy the `server` folder
3. Update `CLIENT_URL` in environment variables

### Database

- Use MongoDB Atlas for production
- Set up proper authentication and security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.
