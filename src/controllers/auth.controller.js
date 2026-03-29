const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

/**
* - user register controller
* - POST /api/auth/register
*/
async function userRegisterController(req,res){
    const {email , password , name} = req.body

    const isExist = await userModel.findOne({
        email:email
    })

    if(isExist){
        return res.status(422).json({
            message:"USer already exist with email",
            status:"failed"
        })
    }

    const user = await userModel.create({
        email,password,name
    })

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET , {expiresIn:"3d"})
    res.cookie("token",token)
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
}


/**
 *  - User Login Controller
 *  - POST /api/auth/login
 */

async function userLoginController(req,res){
    const {email,password} = req.body

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(401).json({
            message:"Email or password is invalid"
        })
    }
    user.comparePassword(password)
}

module.exports = {
    userRegisterController
}