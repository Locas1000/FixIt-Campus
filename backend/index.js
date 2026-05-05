const express = require('express');
const cors = require('cors');

const ticketRoutes = require('./routes/tickets.routes');
const authRoutes = require('./routes/auth.routes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the FixIt Campus API!' });
});

app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});