const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { Event , Enrollement } = require("../models");
const authenticateToken  = require("../middleware/auth");
const { sequelize } = require("../models");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = "uploads/events";
      fs.mkdirSync(dir, { recursive: true });  // Create folder if not exists
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    }
  });
  
  // Configure Multer to handle up to 10 images
  const upload = multer({ storage }).array("images", 5);
  
// ✅ 1. CREATE EVENT
router.post("/create", authenticateToken, upload, async (req, res) => {

    try {
    const { name, location, date, time, description, max_invites } = req.body;
    const userId = req.user.id;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/events/${file.filename}`);
    }
    const event = await Event.create({
      name,
      location,
      date,
      time,
      description,
      max_invites,
      created_by: userId,
      images: imagePaths
    });

    res.status(201).json({ message: "Event created", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});




// // 📋 2. LIST EVENTS with total and available enrollments
router.get("/list", async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{ model: Enrollment, as: "enrollments" }]
    });

    const formatted = events.map(event => {
      const totalEnrolled = event.enrollments.length;
      return {
        id: event.id,
        name: event.name,
        location: event.location,
        date: event.date,
        time: event.time,
        description: event.description,
        images: event.images,
        max_invites: event.max_invites,
        total_enrolled: totalEnrolled,
        available_slots: event.max_invites - totalEnrolled
      };
    });

    res.json({ events: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// // 📥 3. ENROLL IN EVENT
router.post("/enroll/:eventId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    const existing = await Enrollment.findOne({ where: { user_id: userId, event_id: eventId } });
    if (existing) return res.status(409).json({ message: "Already enrolled" });

    const event = await Event.findByPk(eventId, {
      include: [{ model: Enrollment, as: "enrollments" }]
    });

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.enrollments.length >= event.max_invites)
      return res.status(400).json({ message: "Event is full" });

    await Enrollment.create({ user_id: userId, event_id: eventId });

    res.status(201).json({ message: "Enrolled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
