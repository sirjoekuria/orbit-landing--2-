import { RequestHandler } from "express";

// In-memory storage for partnership requests (in production, use a proper database)
let partnershipRequests: any[] = [];
let partnershipIdCounter = 1;

// Sample data for demonstration
const samplePartnershipRequests = [
  {
    id: 'PART-001',
    companyName: 'TechCorp Solutions',
    contactPerson: 'Sarah Wanjiku',
    email: 'sarah@techcorp.co.ke',
    phone: '+254 722 555 123',
    businessCategory: 'E-commerce',
    deliveryVolume: '201-500 deliveries',
    message: 'We are looking for a reliable delivery partner for our growing e-commerce business. We need daily pickups and deliveries across Nairobi.',
    status: 'pending',
    type: 'partnership',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initialize with sample data
partnershipRequests = [];
partnershipIdCounter = 1;

// POST /api/partnership-requests - Submit partnership request
export const submitPartnershipRequest: RequestHandler = (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      businessCategory,
      deliveryVolume,
      message,
      type = 'partnership'
    } = req.body;
    
    if (!companyName || !contactPerson || !email || !phone || !businessCategory || !deliveryVolume || !message) {
      return res.status(400).json({
        error: 'All fields are required for partnership request'
      });
    }

    const newPartnershipRequest = {
      id: `PART-${partnershipIdCounter.toString().padStart(3, '0')}`,
      companyName,
      contactPerson,
      email,
      phone,
      businessCategory,
      deliveryVolume,
      message,
      status: 'pending',
      type,
      timestamp: new Date().toISOString()
    };

    partnershipRequests.push(newPartnershipRequest);
    partnershipIdCounter++;

    res.status(201).json({ 
      success: true, 
      message: 'Partnership request submitted successfully',
      request: {
        id: newPartnershipRequest.id,
        companyName: newPartnershipRequest.companyName,
        status: newPartnershipRequest.status
      }
    });
  } catch (error) {
    console.error('Error creating partnership request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/partnership-requests - Get all partnership requests (admin only)
export const getPartnershipRequests: RequestHandler = (req, res) => {
  try {
    // Sort partnership requests by timestamp (newest first)
    const sortedRequests = [...partnershipRequests].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.json({ 
      success: true, 
      requests: sortedRequests,
      total: partnershipRequests.length,
      stats: {
        pending: partnershipRequests.filter(r => r.status === 'pending').length,
        approved: partnershipRequests.filter(r => r.status === 'approved').length,
        rejected: partnershipRequests.filter(r => r.status === 'rejected').length
      }
    });
  } catch (error) {
    console.error('Error getting partnership requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/partnership-requests/:id/status - Update partnership request status (admin only)
export const updatePartnershipRequestStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const requestIndex = partnershipRequests.findIndex(request => request.id === id);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Partnership request not found' });
    }

    const partnershipRequest = partnershipRequests[requestIndex];
    partnershipRequest.status = status;
    partnershipRequest.updatedAt = new Date().toISOString();
    if (notes) {
      partnershipRequest.adminNotes = notes;
    }

    res.json({ 
      success: true, 
      message: `Partnership request ${status} successfully`,
      request: partnershipRequest
    });
  } catch (error) {
    console.error('Error updating partnership request status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/admin/partnership-requests/:id - Delete partnership request (admin only)
export const deletePartnershipRequest: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const requestIndex = partnershipRequests.findIndex(request => request.id === id);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Partnership request not found' });
    }

    const deletedRequest = partnershipRequests.splice(requestIndex, 1)[0];

    res.json({ 
      success: true, 
      message: 'Partnership request deleted successfully',
      request: deletedRequest
    });
  } catch (error) {
    console.error('Error deleting partnership request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/partnership-requests/:id - Get partnership request details
export const getPartnershipRequest: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const partnershipRequest = partnershipRequests.find(request => request.id === id);
    
    if (!partnershipRequest) {
      return res.status(404).json({ error: 'Partnership request not found' });
    }

    res.json({
      success: true,
      request: partnershipRequest
    });

  } catch (error) {
    console.error('Error getting partnership request:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve partnership request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
