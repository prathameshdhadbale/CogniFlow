const mongoose = require('mongoose');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI
});

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

const connectPostgres = async () => {
    try {
        console.log('⚠️ PostgreSQL connection skipped (optional for now)');
    } catch (error) {
        console.log('⚠️ PostgreSQL not configured');
    }
};

module.exports = {
    connectMongoDB,
    connectPostgres,
    pool
};