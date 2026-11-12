
const mysql = require('mysql2/promise');
require('dotenv').config();

const primary = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PRIMARY_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

const replica = mysql.createPool({
    host: process.env.DB_REPLICA_HOST || process.env.DB_HOST,
    port: Number(process.env.DB_REPLICA_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = {
    primary,
    replica
};
