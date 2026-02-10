// defining user structure or schema

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String ,
        required: true ,
        lowercase: true ,
        unique: true 
    },
    password:{
        type: String,
        required: true ,
        minlength : 6
    },
    preferences:{
        timezone:{
            type:String ,
            default: 'UTC' 
        },
        workHoursStart:{
            type: Number ,
            default: 9
        },
        workHoursEnd:{
            type: Number ,
            default: 18
        },
        notificationsEnabled: {
            type: Boolean ,
            default: true 
        }
    },
    patterns:{
        peakHours:{
            type: [Number] ,
            default: [9,10,11] 
        },
        optimalTaskCount:{
            type:Number ,
            default: 3
        },
        loadTolerance:{
            type:String ,
            default: 'medium'
        },
        consistencyStreak:{
            type:Number,
            default:0
        },
        lastUpdated:{
            type:Date ,
            default: Date.now
        }
    }
},{
    timestamps:true
});

userSchema.index({email:1});

module.exports = mongoose.model('User', userSchema);