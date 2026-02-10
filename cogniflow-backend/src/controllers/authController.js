// login and register 


const User = require('../models/User');
const bcrypt = require('bcryptjs');
const {generateToken} = require('../config/jwt');

const register = async (req , res) => {
    try{
        const {name ,email , password} = req.body ;
        // checking user exists 
        const userExists = await User.findOne({email}) ;
        if(userExists){
            return res.status(400).json({message : "User already exists"}) ;
        }

        const hashedPassword = await bcrypt.hash(password, 10) ;

        // creating user 
        const user = await User.create({
            name,
            email,
            password : hashedPassword
        });

        const token =  generateToken(user._id) ;
        return res.status(201).json({token,user:{id:user._id,name:user.name,email:user.email}}) ;




    }catch(error){
        return res.status(500).json({message : "server error" , error : error.message});

    }
}

const login = async (req,res) => {
    try {
        const {email , password} = req.body ;
        const user = await User.findOne({email});
    
        if(!user){
            return res.status(400).json({message: "Invalid Credentials"}) ;
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password) ;
        if(!passwordMatch){
            return res.status(400).json({message: "Invalid Credentials"}) ;
        }
    
        const token =  generateToken(user._id) ;
        return res.status(200).json({token,user:{id:user._id,name:user.name,email:user.email}}) ;

    }catch(error){
        return res.status(500).json({message : "server error" , error : error.message});

    }



}


const getMe = async (req,res) => {
    try{
        return res.status(200).json(req.user) ;
    }catch(error){
         res.status(500).json({ message: 'Server error', error: error.message });
    }
}


module.exports = {
    register,
    login,
    getMe
};