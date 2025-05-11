const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { User, Post, PostLike, PostComment, PostSave } = require("../models"); // Import models
const authenticateToken = require('../middleware/auth');
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");

// Get all posts
// router.get("/list", async (req, res) => {
//     try {
//       // Get posts along with like count, comment count, and save count
//       const query = `
//         SELECT 
//           posts.id, 
//           posts.description, 
//           posts.images, 
//           posts.user_id,
//           users.name AS user_name,
//           users.profile_image AS user_image,
//           COALESCE(COUNT(DISTINCT post_likes.id), 0) AS like_count,
//           COALESCE(COUNT(DISTINCT post_comments.id), 0) AS comment_count,
//           COALESCE(COUNT(DISTINCT post_saves.id), 0) AS save_count
//         FROM posts
//         LEFT JOIN users ON users.id = posts.user_id
//         LEFT JOIN post_likes ON post_likes.post_id = posts.id
//         LEFT JOIN post_comments ON post_comments.post_id = posts.id
//         LEFT JOIN post_saves ON post_saves.post_id = posts.id
//         GROUP BY posts.id, users.id
//         ORDER BY posts.id DESC;
//       `;
  
//       const results = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
      
//       res.json(results);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   });
  
  
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


router.get('/list', async (req, res) => {
  let userId = 0; // Default for guest users

  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Try to decode token (if present)
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.warn("Invalid token:", err.message);
    }
  }

  try {
    const posts = await sequelize.query(`
      SELECT 
        p.id AS post_id, 
        p.description, 
        p.images, 
        p.user_id,
        u.name AS user_name,
        u.profile_image AS user_image,
        EXISTS (
          SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = :userId
        ) AS is_like,
        EXISTS (
          SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = :userId
        ) AS is_save,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likeCount,
        (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) AS commentCount,
        (SELECT COUNT(*) FROM post_saves WHERE post_id = p.id) AS saveCount
      FROM posts p
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY p.id DESC
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

  

  // router.get('/list', async (req, res) => {
  //   try {
  //     const posts = await sequelize.query(`
  //       SELECT 
  //         p.id AS post_id, 
  //         p.description, 
  //         p.images, 
  //         p.user_id,
  //         u.name AS user_name,
  //         u.profile_image AS user_image,
  //         COUNT(pl.id) AS likeCount,
  //         COUNT(pc.id) AS commentCount,
  //         COUNT(ps.id) AS saveCount

          
  //       FROM posts p
  //       LEFT JOIN users u ON u.id = p.user_id
  //       LEFT JOIN post_likes pl ON pl.post_id = p.id
  //       LEFT JOIN post_comments pc ON pc.post_id = p.id
  //       LEFT JOIN post_saves ps ON ps.post_id = p.id
  //       GROUP BY p.id, u.id
  //       ORDER BY p.id DESC
  //     `, { type: sequelize.QueryTypes.SELECT });
  
  //     res.json(posts);
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ error: err.message });
  //   }
  // });
  
  // POST like on a post
  router.post('/like', async (req, res) => {
    try {
      const { user_id, post_id } = req.body;
  
      const likeExists = await PostLike.findOne({ where: { user_id, post_id } });
  
      if (likeExists) {
        // Unlike if already liked
        await PostLike.destroy({ where: { user_id, post_id } });
        return res.json({ message: 'Post unliked' });
      }
  
      // Like the post
      await PostLike.create({ user_id, post_id });
      res.json({ message: 'Post liked' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  
  // POST comment on a post
  router.post('/comment', async (req, res) => {
    try {
      const { user_id, post_id, comment } = req.body;
  
      await PostComment.create({ user_id, post_id, comment });
      res.json({ message: 'Comment added' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  
  // POST save a post
  router.post('/save', async (req, res) => {
    try {
      const { user_id, post_id } = req.body;
  
      const saveExists = await PostSave.findOne({ where: { user_id, post_id } });
  
      if (saveExists) {
        // Remove save if already saved
        await PostSave.destroy({ where: { user_id, post_id } });
        return res.json({ message: 'Post unsaved' });
      }
  
      // Save the post
      await PostSave.create({ user_id, post_id });
      res.json({ message: 'Post saved' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  
  router.get('/:postId/comments', async (req, res) => {
    const postId = req.params.postId;
  
    try {
      const [comments] = await sequelize.query(`
        SELECT 
          pc.id,
          pc.post_id,
          pc.user_id,
          pc.comment,
          pc.created_at,
          u.name AS user_name,
          u.profile_image AS user_image
        FROM post_comments pc
        LEFT JOIN users u ON u.id = pc.user_id
        WHERE pc.post_id = :postId
        ORDER BY pc.id DESC
      `, {
        replacements: { postId },
      });
  
      res.json(comments);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  router.get('/:userId/saved-posts', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const [savedPosts] = await sequelize.query(`
        SELECT 
          ps.post_id,
          p.description,
          p.images,
          ps.created_at AS saved_at,
          u.name AS post_user_name,
          u.profile_image AS post_user_image
        FROM post_saves ps
        LEFT JOIN posts p ON p.id = ps.post_id
        LEFT JOIN users u ON u.id = p.user_id
        WHERE ps.user_id = :userId
        ORDER BY ps.id DESC
      `, {
        replacements: { userId },
      });
  
      res.json(savedPosts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch saved posts' });
    }
  });
  

  
module.exports = router;
