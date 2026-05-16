// backend/index.js
const express = require('express');
const cors = require('cors');

const ticketRoutes = require('./routes/tickets.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes'); // <-- Added the import

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the FixIt Campus API!' });
});

app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // <-- Mounted the route

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});