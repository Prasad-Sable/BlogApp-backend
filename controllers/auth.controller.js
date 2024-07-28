import {User} from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';
import { configDotenv } from "dotenv";

configDotenv("./.env")

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET;
console.log(process.env.SECRET)

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create the user
    const userDoc = await User.create({
      username,
      password: hashedPassword,
    });

    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'An error occurred: ' + e.message });
  }
};



const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json('Username and password are required');
  }

  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json('Wrong credentials');
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(400).json('Wrong credentials');
    }

    // logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) {
        return res.status(500).json('An error occurred during token generation');
      }
      res.cookie('token', token).json({
        id: userDoc._id,
        username,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json('An error occurred: ' + error.message);
  }
};



const userProfile = async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json('Token is missing');
  }

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(401).json('Invalid token');
    }
    res.json(info);
  });
};


const logoutUser = async (req, res) => {
  res.cookie('token', '', { expires: new Date(0) }).json('ok');
};



export {
  registerUser,
  loginUser,
  userProfile,
  logoutUser
}