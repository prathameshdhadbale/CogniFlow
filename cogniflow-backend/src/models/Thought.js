// thought schema 

const mongoose = require('mongoose'); 

const thoughtSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId ,
        required:true,
        ref:'User'
    },
    content:{
        type:String ,
        required:true
    },
    processedInsights: [{
        type:{
            type:String 
        },
        signal:{
            type:String 
        },
        confidence:{
            type:Number ,
            min: 0 ,
            max: 1 
        }
    }],
    affectedScheduling:{
        type:Boolean ,
        default:false 
    },
    usedInSchedule:{
        type:Date
    }
},{
    timestamps: true
})

thoughtSchema.index({ userId: 1 });
thoughtSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Thought', thoughtSchema);