import mongoose from "mongoose";


mongoose.connect("mongodb+srv://devTinder:8CwgLg0aLYYeCw4r@devtinder.glagl.mongodb.net/paytm")
.then(() => Console.log("MongoDb is connected"))
.catch(err => console.error('❌ Connection error:', err));


const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        userName: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        emailId: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            trim: true
        },

    }, 
    {
        timestamps: true
    }
)

const User = mongoose.model("User", userSchema);

module.exports = {
    User
}