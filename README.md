# WatchParty - YouTube Watch Party Application

A full-stack YouTube Watch Party web application with real-time synchronization, voice & video calls, private rooms, and an advanced admin panel.

## Features

### Core Features
- **Private Rooms**: Create and join private watch party rooms with unique codes
- **Real-time Sync**: Perfect playback synchronization for all participants
- **Live Chat**: Real-time messaging with emoji support
- **Voice & Video Calls**: WebRTC-powered HD video and voice communication
- **Screen Sharing**: Share your screen with room participants
- **Host Controls**: Manage participants, control playback, and moderate chat

### User Features
- Secure authentication (JWT-based)
- User profiles with avatars
- Room history
- Preferences (theme, notifications)
- Password management

### Admin Features
- Dashboard with analytics
- User management (ban, delete, promote)
- Room management
- System monitoring
- Real-time statistics

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui components
- Socket.io-client
- React Router DOM
- Zustand (state management)

### Backend
- Node.js + Express
- Socket.io (WebSocket)
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs (password hashing)
- Helmet (security)
- Express Rate Limit

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, Socket, Theme)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities (API client)
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database config
│   ├── middleware/        # Auth, error handling
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── socket/            # Socket.io handlers
│   └── server.js          # Entry point
├── render.yaml            # Render deployment config
└── README.md
```

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd watchparty
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

3. Set up environment variables:

Create `.env` in the server directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/watchparty
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Create `.env` in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the development servers:

```bash
# Start backend (from server directory)
cd server && npm run dev

# Start frontend (from root directory)
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Deployment on Render

### 1. Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0)
5. Get your connection string

### 2. Deploy Backend (Web Service)

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: watchparty-api
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `MONGODB_URI`: your-atlas-connection-string
   - `JWT_SECRET`: generate-a-random-string
   - `JWT_EXPIRE`: 7d
   - `CLIENT_URL`: your-frontend-url (after deploying frontend)
5. Click "Create Web Service"

### 3. Deploy Frontend (Static Site)

1. In Render dashboard, click "New +" → "Static Site"
2. Connect the same repository
3. Configure:
   - **Name**: watchparty-app
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: your-backend-url/api
   - `VITE_SOCKET_URL`: your-backend-url
5. Click "Create Static Site"

### 4. Update CORS

After deploying both services, update the `CLIENT_URL` environment variable in your backend to match your frontend URL.

## Environment Variables

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_SOCKET_URL` | WebSocket server URL |

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port |
| `NODE_ENV` | Environment (development/production) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRE` | JWT token expiration |
| `CLIENT_URL` | Frontend URL for CORS |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:code` - Get room by code
- `POST /api/rooms/:code/join` - Join room
- `PUT /api/rooms/:code` - Update room
- `DELETE /api/rooms/:code` - Delete room

### Users (Admin)
- `GET /api/users` - List all users
- `PUT /api/users/:id/role` - Update user role
- `POST /api/users/:id/ban` - Ban user
- `POST /api/users/:id/unban` - Unban user
- `DELETE /api/users/:id` - Delete user

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/users` - List users (admin)
- `GET /api/admin/rooms` - List rooms (admin)
- `GET /api/admin/system` - System status

## WebSocket Events

### Client → Server
- `join-room` - Join a room
- `leave-room` - Leave current room
- `send-message` - Send chat message
- `video-state-change` - Update video playback
- `change-video` - Change video URL
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `webrtc-ice-candidate` - ICE candidate

### Server → Client
- `room-joined` - Successfully joined room
- `user-joined` - New user joined
- `user-left` - User left room
- `new-message` - New chat message
- `video-state-updated` - Video state changed
- `user-kicked` - User was kicked

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet security headers
- Input validation
- XSS protection
- SQL injection prevention (NoSQL)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and feature requests, please open an issue on GitHub.

---

Built with ❤️ using React, Node.js, and Socket.io
