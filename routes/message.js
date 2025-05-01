const express = require('express');
const router = express.Router();
const { Message, User } = require('../models');
const authenticateToken = require('../middleware/auth');
const { Op } = require('sequelize');

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  const { receiver_id, message } = req.body;
  const sender_id = req.user.id;

  try {
    const newMessage = await Message.create({ sender_id, receiver_id, message });
    res.status(201).json({ success: true, message: 'Message sent', data: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get chat list (latest message per user)
router.get('/chat-list', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [chatList] = await Message.sequelize.query(`
      SELECT DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
        id, sender_id, receiver_id, message, "createdAt"
      FROM messages
      WHERE sender_id = ${userId} OR receiver_id = ${userId}
      ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), "createdAt" DESC
    `);

    res.json({ success: true, data: chatList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get chat detail between two users
router.get('/chat-detail/:userId', authenticateToken, async (req, res) => {
  const senderId = req.user.id;  // The user who is sending the request (from the token)
  const receiverId = parseInt(req.params.userId);  // The user with whom the chat is being fetched

  console.log(senderId, receiverId);

  try {
    // Fetch messages where either the authenticated user is the sender or receiver
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId }
        ]
      },
      order: [['createdAt', 'ASC']]  // Order by creation time in ascending order
    });

    // Return the chat messages
    res.json({ success: true, data: messages });
  } catch (err) {
    // If there's an error, return the error message
    res.status(500).json({ success: false, error: err.message });
  }
});
module.exports = router;
