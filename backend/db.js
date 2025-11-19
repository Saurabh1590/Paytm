import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.DATABASE_URL);
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.error("❌ Connection error:", err));

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    emailId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


const accountSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        balance: {
            type: Number,
            required: true
        }
    }
)

export const User = mongoose.model("User", userSchema);
export const Account = mongoose.model("Account", accountSchema);
