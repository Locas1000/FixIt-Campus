// create pool to prevent oversaturation of DB
const {Pool} = require('pg');

// DB conection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


pool.on('connect',() => {
    console.log('Connected to DB');
});
pool.on('error', (err) => {
    console.error('error to connect',err);
    process.exit(0);
});

module.exports = pool;