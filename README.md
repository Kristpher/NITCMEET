
# NITCMeet – Secure Video Calling App

A simple video calling and screen-sharing web application designed for private, secure communication within a room. This project was created as a college project to learn and implement WebRTC, Socket.io, and real-time peer-to-peer communication.

---

## Features

- Create secure private rooms  
- Admin approval before participants can join  
- High-quality video calling  
- Screen sharing with toggle controls  
- Chat functionality within the call  
- Mute/unmute and video on/off options  
- Disconnect and call termination handling  
- Audio stream handling even during screen sharing  
- Negotiation handling with peer connections  

---

## Tech Stack

- **Frontend:** React.js, ReactPlayer, CSS  
- **Backend:** Node.js, Express.js, Socket.io  
- **WebRTC:** Peer-to-peer video and audio streaming  
- **Security:** HTTPS using SSL certificates  

---

## Installation & Setup

### Clone the repository

```bash
git clone https://github.com/Kristpher/NITCMeet.git
cd NITCMeet
```

### Generate SSL Certificates (for local HTTPS)

```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

This creates `cert.pem` and `key.pem` files for secure connections. These files are ignored in `.gitignore`.

### Install backend dependencies

```bash
cd backend
npm install
```

### Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Start the backend

```bash
cd ../backend
node index.js
```

### Start the frontend (in a new terminal)

```bash
cd ../frontend
npm start
```

---

## Folder Structure

```
NITCMeet/
├── backend/               # Backend (Node + Express + Socket.io)
│   ├── index.js           # Main backend server
│   ├── cert.pem           # SSL Certificate (ignored in git)
│   ├── key.pem            # SSL Key (ignored in git)
│   ├── build/             # Frontend build served from backend
│   └── package.json       # Backend dependencies
├── frontend/              # Frontend (React)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # Socket context
│   │   ├── services/      # WebRTC peer handling
│   │   ├── App.js         # Root app
│   │   └── index.js       # Entry point
│   └── package.json       # Frontend dependencies
├── .gitignore             # Ignore node_modules, cert.pem, key.pem
├── README.md              # Project documentation
```

---

## Backend Dependencies

- express – Web framework  
- socket.io – Real-time communication  
- cors – Handle cross-origin requests  
- fs – File system module (built-in)  
- https – HTTPS server (built-in)  
- path – File path handling (built-in)  

---

## Frontend Dependencies

- react – UI library  
- react-player – Handle media streams  
- socket.io-client – Communicate with backend  
- react-router-dom – Routing  
- css – Styling  

---


## 🌐 Ngrok Usage (For Public Access)

I wanted to use this application publicly (beyond localhost), so I used **Ngrok** to expose my local server to the internet.

### Install and run Ngrok:

1. Download ngrok from [https://ngrok.com/](https://ngrok.com/)
2. Install ngrok and sign in if required.
3. Run ngrok on backend HTTPS port:

```bash
ngrok http https://localhost:8001
```

4. Ngrok will give you a public HTTPS URL (e.g., `https://abcd-1234.ngrok-free.app`).

### 🔗 Update this URL in two places:

- **Frontend:**
  - Go to `Socket.jsx` and replace the previous URL with your new ngrok URL.

- **Backend:**
  - Go to `index.js` and update the CORS origin to your new ngrok URL.

### Example for backend CORS update:

```js
const io = new Server(server, {
  cors: {
    origin: "https://abcd-1234.ngrok-free.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

> Every time you restart ngrok, it generates a new URL unless you have a paid plan with reserved domains. Make sure to update the URL in both frontend and backend each time.


## Important Notes

- You must use HTTPS for WebRTC to function correctly in most browsers.  
- The app is designed with a simple admin-based approval model.  
- The cert.pem and key.pem files are intentionally ignored from git for security.

---

## Acknowledgements

- WebRTC  
- Socket.io  
- React.js  
- Node.js & Express.js  

---

## Author

- Made by Navaneeth DS  
- GitHub: [https://github.com/kristpher](https://github.com/kristpher)  
