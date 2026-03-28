const mongoose = require('mongosoe')

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:[true,'Email is required for creating user'],
        trim:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid email address"],
        unique:[true,"Email already exist"]
    },
    name:{
        type:String,
        required:[true,"Name is required forcreating account"]
    },
    password:{
        type:String,
        required:[true,"password is required for creating account"],
        minLenght:[6,"password should contain more tha 6 character"],
        select:false
    }
},{
    timestamps:true
})

userSchema.pre("save",async function(next){
    
})