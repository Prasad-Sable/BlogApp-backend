
import fs from "fs"
import jwt from "jsonwebtoken";
import {Post} from "../models/Post.js"
import bcrypt from "bcryptjs"

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET;


const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json('File is missing');
    }

    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = `${path}.${ext}`;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json('Token is missing');
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json('Invalid token');
      }

      const { title, summary, content } = req.body;
      if (!title || !summary || !content) {
        return res.status(400).json('Missing required fields');
      }

      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });

      res.json(postDoc);
    });
  } catch (error) {
    res.status(500).json('An error occurred: ' + error.message);
  }
};


const updatePost = async (req, res) => {
  try {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = `${path}.${ext}`;
      fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json('Token is missing');
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json('Invalid token');
      }

      const { id, title, summary, content } = req.body;
      const postDoc = await Post.findById(id);
      if (!postDoc) {
        return res.status(404).json('Post not found');
      }

      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(403).json('You are not the author');
      }

      postDoc.title = title;
      postDoc.summary = summary;
      postDoc.content = content;
      if (newPath) {
        postDoc.cover = newPath;
      }

      await postDoc.save();
      res.json(postDoc);
    });
  } catch (error) {
    res.status(500).json('An error occurred: ' + error.message);
  }
};



const allPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred: ' + error.message });
  }
};


const singlePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const postDoc = await Post.findById(id).populate('author', ['username']);
    if (!postDoc) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(postDoc);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred: ' + error.message });
  }
};



export {
  createPost,
  updatePost,
  allPost,
  singlePost
}