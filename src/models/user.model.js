const mongoose = require('mongoose')
const bcypt = require('bcryptjs')

const userSchema =new mongoose.Schema({
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

userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return 
    }
    const hash = await bcypt.hash(this.password,10)
    this.password = hash
    return 
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel