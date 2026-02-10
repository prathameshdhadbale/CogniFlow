const mongoose = require('mongoose') ;
const {Pool} = require('pg') ;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI
});

// connecting to mogodb database
const connectMongoDB= async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI , {
            useNewURLParser: true ,
            useUnifiedTopology: true
        });

        console.log(`MongoDB connected: ${mongoose.connection.host}`);         

    }catch(error){
        console.log(error.message) ;
        process.exit(1);
    }
};


//connecting to postgres database 
const connectPostgres = async ()=>{
    try{
        const result = await pool.query('select now()');
        console.log('Postgres connected ', result.rows[0].now);
    }catch(error){
        console.log(error.message) ;
        process.exit(1);
    }
};


module.exports = {
    connectMongoDB,
    connectPostgres,
    pool
};