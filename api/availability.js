// pages/api/availability.js

export default function handler(req, res) {
    // In a real app, this would connect to a DB or CMS
    const availability = {
      total: 24,
      booked: 10, // Simulate a changing number here
      updatedAt: new Date().toISOString()
    };
  
    res.status(200).json(availability);
  }
  