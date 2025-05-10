const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models"); // ✅ Import db
const { User } = require('../models');
const authenticateToken = require('../middleware/auth');
const { sequelize } = require('../models');
const multer = require("multer");
const path = require('path');
const fs = require('fs');



// Set up Multer storage for profile image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/profile_images';
    // Ensure the directory exists before uploading the file
    fs.mkdirSync(dir, { recursive: true });  // <-- Create directory if not exists
    cb(null, dir);  // Save the file to 'uploads/profile_images' folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));  // <-- Add file extension handling
  }
});

const upload = multer({ storage: storage });

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } }); // ✅ This line works now

    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashed });

    const token = jwt.sign({ id: newUser.id }, "your_secret_key", {
      expiresIn: "7d",
    });

    const user = newUser.toJSON();
    delete user.password;

    res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password, latitude, longitude } = req.body;

    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    await user.update({
      latitude,
      longitude,
      is_available: 1,
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const users = user.toJSON();
    delete user.password;
    res.status(201).json({
      users,
      token,
    });
    // res.status(200).json({
    //   user: {
    //     id: user.id,
    //     email: user.email,
    //     latitude: user.latitude,
    //     longitude: user.longitude,
    //     is_available: user.is_available,
    //   },
    //   token,
    // });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update({ is_available: 0 });

    res.status(200).json({ message: "Logged out successfully", is_available: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET nearby users
router.get("/nearby-users", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the current user's location
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { latitude, longitude } = user;
    const radius = parseFloat(req.query.radius || 1);

    const users = await sequelize.query(
      `
      SELECT * FROM (
        SELECT *,
        (6371 * acos(
            cos(radians(:latitude)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(:longitude)) +
            sin(radians(:latitude)) * sin(radians(latitude))
        )) AS distance
        FROM users
        WHERE is_available = true
      ) AS subquery
      WHERE distance <= :radius
      ORDER BY distance ASC
      `,
      {
        replacements: { latitude, longitude, radius },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'latitude', 'longitude', 'is_available']
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.put("/update-profile", authenticateToken, upload.single('profile_image'), async (req, res) => {
  try {
    const userId = req.user.id;  // Now req.user should have the id
    const { name, username, age, gender, bio } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (username) user.username = username;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (bio) user.bio = bio;

    if (req.file) {
      user.profile_image = `/uploads/profile_images/${req.file.filename}`;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        profile_image: user.profile_image,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error updating profile" });
  }
});


// router.get("/nearby-users", async (req, res) => {
//   try {
//     const { latitude, longitude, radius = 1 } = req.query; // radius in kilometers

//     const users = await sequelize.query(
//       `
//       SELECT id, email, latitude, longitude, is_available,
//       (6371 * acos(
//           cos(radians(:latitude)) * cos(radians(latitude)) *
//           cos(radians(longitude) - radians(:longitude)) +
//           sin(radians(:latitude)) * sin(radians(latitude))
//       )) AS distance
//       FROM Users
//       WHERE is_available = 1
//       HAVING distance <= :radius
//       ORDER BY distance ASC
//       `,
//       {
//         replacements: { latitude, longitude, radius },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     res.status(200).json({ users });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
