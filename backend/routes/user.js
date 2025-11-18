import express from "express";
import zod from "zod";
import { User } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config.js";
import authMiddleware from "../middleware.js";

const router = express.Router();

const signupBody = zod.object({
  username: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
  emailId: zod.string().email(),
});

router.post("/signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      message: "Invalid input",
    });
  }

  const { username, firstName, lastName, emailId, password } = req.body;

  const existingUser = await User.findOne({
    username,
  });

  if (existingUser) {
    return res.status(409).json({
      message: "User Already exist",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    firstName,
    lastName,
    emailId,
    password: hashPassword,
  });

  const userId = newUser._id;

  const token = jwt.sign({ userId: newUser._id }, JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  return res.json({
    message: "User created successfully",
    token,
  });
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  return res.json({
    message: "User login successful",
    token,
    user: {
      username: user.username,
      firstName: user.firstName,
      emailId: user.emailId,
    },
  });
});

// router.put("/", authMiddleware, async (req, res) => {
//     const {password, firstName, lastName, userId} = req.body;

//     try{
//         const updatedUser = await User.findByIdAndUpdate(userId, {
//         password,
//         firstName,
//         lastName
//     })


//     } catch(err) {
//         return res.status(401).json({
//             message: "User does not found"
//         })
//     }

//     res.s

    


// })
export default router;
