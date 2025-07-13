const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, authorizeAdmin, authorizeUserOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/events
// @desc    Create a new event (Admin only)
// @access  Private (Admin)
router.post('/', protect, authorizeAdmin, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').trim().isLength({ min: 5, max: 200 }).withMessage('Location must be between 5 and 200 characters'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('category').isIn(['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Other']).withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      date,
      time,
      location,
      capacity,
      category,
      price = 0,
      image = 'default-event.jpg'
    } = req.body;

    // Check if event date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    const event = await Event.create({
      title,
      description,
      date: eventDate,
      time,
      location,
      capacity,
      category,
      price,
      image,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating event'
    });
  }
});

// @route   GET /api/events
// @desc    Get all events (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    // Apply filters
    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      data: { events }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID (Public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registeredUsers', 'name email phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event (Admin only)
// @access  Private (Admin)
router.put('/:id', protect, authorizeAdmin, [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date'),
  body('time').optional().notEmpty().withMessage('Time is required'),
  body('location').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Location must be between 5 and 200 characters'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('category').optional().isIn(['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Other']).withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event date is in the future (if being updated)
    if (req.body.date) {
      const eventDate = new Date(req.body.date);
      if (eventDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Event date must be in the future'
        });
      }
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Remove event from all users' registeredEvents
    await User.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id } }
    );

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register user for an event
// @access  Private (User/Admin)
router.post('/:id/register', protect, authorizeUserOrAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is full
    if (event.isFull) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if event date has passed
    if (new Date(event.date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
    }

    // Check if user is already registered
    if (event.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Add user to event
    event.registeredUsers.push(req.user._id);
    await event.save();

    // Add event to user's registered events
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { registeredEvents: event._id } }
    );

    res.json({
      success: true,
      message: 'Successfully registered for the event',
      data: { event }
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering for event'
    });
  }
});

// @route   DELETE /api/events/:id/register
// @desc    Unregister user from an event
// @access  Private (User/Admin)
router.delete('/:id/register', protect, authorizeUserOrAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is registered
    if (!event.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Remove user from event
    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user._id.toString()
    );
    await event.save();

    // Remove event from user's registered events
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { registeredEvents: event._id } }
    );

    res.json({
      success: true,
      message: 'Successfully unregistered from the event',
      data: { event }
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unregistering from event'
    });
  }
});

module.exports = router; 