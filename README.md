# DevCollab - Real-Time Collaborative Code Editor

A powerful browser-based collaborative coding platform that enables multiple developers to write, edit, and discuss code in real-time. Built with modern web technologies for seamless real-time synchronization.

![DevCollab](https://img.shields.io/badge/DevCollab-Real--Time%20Collaboration-4ECDC4)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.0+-010101?logo=socket.io)
![Redis](https://img.shields.io/badge/Redis-Latest-DC382D?logo=redis)

## Features

### Core Functionality
- **Real-time Code Synchronization** - See changes instantly as others type
- **Multi-Language Support** - 12+ programming languages with syntax highlighting
- **Live User Presence** - See who's currently in your coding session
- **Integrated Chat** - Discuss code without leaving the editor
- **Monaco Editor** - VS Code's powerful editor in your browser
- **Room-based Sessions** - Create private rooms with unique IDs
- **Persistent Sessions** - Rooms persist for 24 hours with Redis

### Supported Languages
JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, HTML, CSS, SQL

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + Vite | Fast, modern UI with hot module replacement |
| **Editor** | Monaco Editor | Professional code editing experience |
| **Backend** | Node.js + Express | RESTful API and WebSocket server |
| **Real-time** | Socket.IO | Bidirectional real-time communication |
| **Database** | Redis | In-memory storage for room sessions |
| **Containerization** | Docker | Easy deployment and scaling |

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Redis server (local or Docker)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/devcollab.git
cd devcollab
```

2. **Install dependencies**
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

3. **Configure environment variables**

Create `.env` in `server/`:
```env
PORT=3001
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

Create `.env` in `client/`:
```env
VITE_SERVER_URL=http://localhost:3001
```

### Running the Application

#### Option 1: Local Development

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
```

Open http://localhost:5173 in your browser.

#### Option 2: Docker Compose

```bash
docker-compose up --build
```

## Usage

1. **Create a Room**
   - Enter your name
   - Click "Create Room"
   - Share the Room ID with collaborators

2. **Join a Room**
   - Enter your name
   - Paste the Room ID
   - Click "Join Room"

3. **Start Collaborating**
   - Write code together in real-time
   - Switch languages from the dropdown
   - Chat with team members in the sidebar
   - See active users with color indicators

## Project Structure

```
devcollab/
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── index.js       # Express server setup
│   │   ├── socket.js      # Socket.IO event handlers
│   │   └── roomManager.js # Redis room management
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # React pages
│   │   │   ├── HomePage.jsx
│   │   │   └── EditorPage.jsx
│   │   ├── components/    # Reusable components
│   │   │   ├── Editor.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useSocket.js
│   │   ├── App.jsx        # Main app component
│   │   └── socket.js      # Socket client setup
│   ├── package.json
│   └── .env
│
├── docker-compose.yml     # Docker orchestration
├── .gitignore
└── README.md
```

## API & Events

### Socket.IO Events

#### Client → Server
- `join-room` - Join a coding room
- `code-change` - Broadcast code changes
- `language-change` - Switch programming language
- `send-message` - Send chat message
- `cursor-move` - Share cursor position

#### Server → Client
- `room-joined` - Confirmation with room state
- `user-joined` - New user notification
- `user-left` - User disconnection
- `code-update` - Incoming code changes
- `language-update` - Language switch notification
- `receive-message` - Incoming chat message

## Deployment

### Deploy to Render

1. **Backend Service**
   - Create new Web Service on Render
   - Connect GitHub repository
   - Set root directory: `server`
   - Build command: `npm install`
   - Start command: `node src/index.js`
   - Add Redis internal database

2. **Frontend Static Site**
   - Create new Static Site
   - Set root directory: `client`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Set environment variable: `VITE_SERVER_URL`

### Deploy with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Or build individually
docker build -t devcollab-server ./server
docker run -p 3001:3001 devcollab-server
```

## Development

### Available Scripts

**Backend:**
```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start production server
```

**Frontend:**
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `CLIENT_URL` in server `.env` matches frontend URL |
| Redis connection failed | Ensure Redis is running: `redis-cli ping` |
| Port already in use | Change ports in `.env` files |
| Code not syncing | Check browser console for WebSocket errors |
| Docker build fails | Ensure Docker daemon is running |

## Future Enhancements

- [ ] File tree navigation for multiple files
- [ ] Code execution with online compiler
- [ ] Voice/video chat integration
- [ ] Syntax error highlighting
- [ ] Git integration
- [ ] Custom themes
- [ ] Code templates library
- [ ] Export/download code
- [ ] User authentication
- [ ] Private room passwords

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [Socket.IO](https://socket.io/) - Real-time bidirectional event-based communication
- [Redis](https://redis.io/) - In-memory data structure store
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ by developers, for developers**