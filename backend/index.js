const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the FixIt Campus API!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});