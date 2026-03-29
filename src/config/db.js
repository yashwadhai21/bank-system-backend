const mongoose = require('mongoose')


function connectToDB(){
    console.log("Attempting to connect to MongoDB...")
    mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000
    })
    .then(()=>{
        console.log("server is connected to DB")
    })
    .catch(err=>{
        console.log("Error connecting to DB:", err.message)
        console.log("Full error:", err)
        process.exit(1)
    })
}

module.exports=connectToDB