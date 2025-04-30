const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { Post } = require("../models");
const authenticateToken = require('../middleware/auth');
const { sequelize } = require("../models");

// Get all posts
router.get("/list", async (req, res) => {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          posts.id, 
          posts.description, 
          posts.images, 
          posts.user_id,
          users.name as user_name,
          users.profile_image as user_image
        FROM posts
        JOIN users ON users.id = posts.user_id
        ORDER BY posts.id DESC
      `);
  
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/posts";
    fs.mkdirSync(dir, { recursive: true });  // Create folder if not exists
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// Configure Multer to handle up to 10 images
const upload = multer({ storage }).array("images", 10);

// Route to handle post creation with images
router.post("/create", authenticateToken, upload, async (req, res) => {
    try {
      const { description } = req.body; // Get description from body
  
      // If no images are uploaded
      let imagePaths = [];
      if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => `/uploads/posts/${file.filename}`);
      }
  
      // Check if user is authenticated (req.user should be populated)
      const userId = req.user.id; // This is where the error occurs if req.user is undefined
  
      if (!userId) {
        return res.status(400).json({ error: 'User not authenticated' });
      }
  
      // Save the post to the database
      const newPost = await Post.create({
        description,
        images: imagePaths,
        user_id: userId, // Use the authenticated user ID
      });
  
      // Return the newly created post
      res.status(201).json({
        message: "Post created successfully",
        post: newPost, 
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router;
