import { RequestHandler } from "express";
import path from "path";
import fs from "fs";

// JSON file operations (fallback when Supabase is not available)
const MESSAGES_FILE = path.join(process.cwd(), 'server', 'data', 'messages.json');

function loadMessages(): any[] {
  try {
    if (!fs.existsSync(MESSAGES_FILE)) return [];
    const raw = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Failed to load messages:', e);
    return [];
  }
}

function saveMessages(messages: any[]) {
  try {
    const dir = path.dirname(MESSAGES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save messages:', e);
  }
}

function getNextMessageId(existingMessages: any[]): string {
  if (existingMessages.length === 0) return 'MSG-001';

  const ids = existingMessages
    .map(m => {
      const parts = m.id.split('-');
      return parts.length === 2 ? parseInt(parts[1]) : 0;
    })
    .filter(id => !isNaN(id));

  const maxId = Math.max(0, ...ids);
  return `MSG-${(maxId + 1).toString().padStart(3, '0')}`;
}

// POST /api/messages - Create a new message
export const createMessage: RequestHandler = async (req, res) => {
  try {
    const { name, email, phone, subject, message, timestamp } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, subject, and message are required'
      });
    }

    let messages = loadMessages();

    const newMessage = {
      id: getNextMessageId(messages),
      name,
      email,
      phone: phone || '',
      subject,
      message,
      timestamp: timestamp || new Date().toISOString(),
      status: 'new'
    };

    messages.push(newMessage);
    saveMessages(messages);

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
export const getMessages: RequestHandler = async (req, res) => {
  try {
    const messages = loadMessages();

    // Sort messages by timestamp (newest first)
    const sortedMessages = [...messages].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

    res.json({
      success: true,
      messages: paginatedMessages,
      total: messages.length,
      page,
      limit,
      totalPages: Math.ceil(messages.length / limit)
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/messages/:id - Update message status
export const updateMessageStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: new, read, replied'
      });
    }

    const messages = loadMessages();
    const messageIndex = messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    messages[messageIndex].status = status;
    messages[messageIndex].updatedAt = new Date().toISOString();

    saveMessages(messages);

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
