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

const updateBody = zod.object({
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    password: zod.string().optional()
})

router.put("/", authMiddleware, async (req, res) => {
    const {success} = updateBody.safeParse(req.body);
    if(!success) {
        return res.status(400).json({
      message: "Error while updating user info",
    })};

    const { firstName, lastName, password } = req.body;
    const hashPassword = await bcrypt.hash(password,10);

    await User.updateOne(
        { _id: req.userId }, 
        { $set: { firstName, lastName, password:hashPassword } } 
    );


    res.status(200).json({
        message: "User updated successfully"
    })

})

router.get("/bulk", async (req, res) => {
  try {
    const filter = String(req.query.filter || "").trim();

    if (filter.length < 2) {
      return res.status(400).json({ message: "Search term too short" });
    }

    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safe = escape(filter);

    const regex = new RegExp(safe, "i");

    const users = await User.find({
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } }
      ]
    }).select("username firstName lastName");

    return res.json({
      users: users.map(u => ({
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        _id: u._id
      }))
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
