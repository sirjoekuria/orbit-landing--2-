import { RequestHandler } from "express";

// In-memory storage for messages (in production, use a proper database)
let messages: any[] = [];
let messageIdCounter = 1;

// POST /api/messages - Create a new message
export const createMessage: RequestHandler = (req, res) => {
  try {
    const { name, email, phone, subject, message, timestamp } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, subject, and message are required' 
      });
    }

    const newMessage = {
      id: `MSG-${messageIdCounter.toString().padStart(3, '0')}`,
      name,
      email,
      phone: phone || '',
      subject,
      message,
      timestamp: timestamp || new Date().toISOString(),
      status: 'new'
    };

    messages.push(newMessage);
    messageIdCounter++;

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: newMessage.id
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/messages - Get all messages (admin only)
export const getMessages: RequestHandler = (req, res) => {
  try {
    // Sort messages by timestamp (newest first)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.json({ 
      success: true, 
      messages: sortedMessages,
      total: messages.length 
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/messages/:id - Update message status
export const updateMessageStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: new, read, replied' 
      });
    }

    const messageIndex = messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    messages[messageIndex].status = status;
    messages[messageIndex].updatedAt = new Date().toISOString();

    res.json({ 
      success: true, 
      message: 'Message status updated successfully',
      updatedMessage: messages[messageIndex]
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
