// Start the Rada server on port 3001
require('dotenv').config();

// Set PORT to 3001 before loading server
process.env.PORT = '3001';

// Load and start the server
require('./server.js');