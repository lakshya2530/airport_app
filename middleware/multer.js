// middlewares/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/posts";
    fs.mkdirSync(dir, { recursive: true }); // Create folder if not exists
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

module.exports = upload;
