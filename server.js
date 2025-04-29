

const express = require('express');
const cors = require('cors'); // Import cors package
const { Server } = require('socket.io');
const http = require('http');

const app = express();
require('dotenv').config();
const server = http.createServer(app); // Important: create server
const io = new Server(server, {
  cors: {
    origin: '*', // allow all origins (change for production)
    methods: ['GET', 'POST']
  }
});
app.use(cors());
app.use(express.json());

// Routes

const userRoutes = require('./routes/users');



app.listen(3000, () => console.log('Server running on port 3000'));


