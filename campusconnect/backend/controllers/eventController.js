const Event = require('../models/Event');
const Club = require('../models/Club');
const EventOrganizer = require('../models/EventOrganizer');
const Registration = require('../models/Registration');
const User = require('../models/User');
const mongoose = require('mongoose');

// Using Mongoose ORM for standard CRUD operations (80% of database operations)
// ----------------------------------------------------------------------------

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    // Update event statuses based on current date/time
    await Event.updateEventStatuses();
    
    const events = await Event.find()
      .populate('clubId', 'name category')
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: -1 });
      
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single event with all details
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId) && !isNaN(eventId)) {
      console.log(`Invalid ObjectId format: ${eventId} - Attempting to handle numeric ID`);
      
      // For backward compatibility with numeric IDs
      // Try to find events and return the one at the specified index
      const events = await Event.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(eventId) + 10); // Get enough events to include the desired index
      
      // Check if we have an event at the specified index
      const indexedEvent = events[parseInt(eventId) - 1]; // Convert to 0-based index
      
      if (indexedEvent) {
        console.log(`Found event at index ${eventId}: ${indexedEvent.title}`);
        return res.json(indexedEvent);
      } else {
        return res.status(404).json({ message: 'Event not found by index' });
      }
    }
    
    // Normal ObjectId lookup
    const event = await Event.findById(eventId)
      .populate('clubId', 'name category departmentAffiliation')
      .populate('createdBy', 'firstName lastName');
      
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get event organizers if applicable
    let eventData = event.toObject();
    
    try {
      // Only get organizers if the model exists
      if (typeof EventOrganizer !== 'undefined' && EventOrganizer.getEventOrganizers) {
        const organizers = await EventOrganizer.getEventOrganizers(event._id);
        eventData.organizers = organizers;
      }
    } catch (orgError) {
      console.log('Skipping organizers data:', orgError.message);
    }
    
    // Get registration count if applicable
    try {
      if (typeof Registration !== 'undefined') {
        const registrationCount = await Registration.countDocuments({
          eventId: event._id,
          status: { $in: ['registered', 'attended'] }
        });
        
        eventData.registrationCount = registrationCount;
        eventData.availableSpots = event.capacity - registrationCount;
      }
    } catch (regError) {
      console.log('Skipping registration data:', regError.message);
    }
    
    res.json(eventData);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { 
      clubId, title, description, category, startDate, endDate,
      location, venue, capacity, registrationDeadline, organizers
    } = req.body;
    
    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(400).json({ message: 'Invalid club ID' });
    }
    
    // Validate event dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const deadlineObj = new Date(registrationDeadline);
    
    if (endDateObj <= startDateObj) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    if (deadlineObj >= startDateObj) {
      return res.status(400).json({ message: 'Registration deadline must be before start date' });
    }
    
    // Create new event using Mongoose ORM
    const newEvent = new Event({
      clubId,
      title,
      description,
      category,
      startDate,
      endDate,
      location,
      venue,
      capacity,
      registrationDeadline,
      createdBy: req.user ? req.user.id : '67e988e5d2130196d11add79' // Use a default user ID if no authentication
    });
    
    const savedEvent = await newEvent.save();
    
    // Add organizers if provided
    if (organizers && organizers.length > 0) {
      const organizerPromises = organizers.map(org => {
        return new EventOrganizer({
          eventId: savedEvent._id,
          userId: org.userId,
          role: org.role
        }).save();
      });
      
      await Promise.all(organizerPromises);
    }
    
    // Add creator as a host organizer if not already in the organizers list
    const userId = req.user ? req.user.id : '67e988e5d2130196d11add79'; // Use same default ID
    const creatorIsOrganizer = organizers?.some(org => org.userId === userId);

    if (!creatorIsOrganizer) {
    await new EventOrganizer({
      eventId: savedEvent._id,
      userId: userId,
      role: 'host'
      }).save();
    }
    
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing event
exports.updateEvent = async (req, res) => {
  try {
    const {
      clubId, title, description, category, startDate, endDate,
      location, venue, capacity, registrationDeadline, organizers
    } = req.body;
    
    // Find the event
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check authorization (only organizers or admins can edit)
    const isOrganizer = await EventOrganizer.isEventOrganizer(event._id, req.user.id);
    
    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    // Don't allow changes to completed or cancelled events
    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot update a ${event.status} event` });
    }
    
    // Validate dates if provided
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      if (endDateObj <= startDateObj) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }
    
    if (startDate && registrationDeadline) {
      const startDateObj = new Date(startDate);
      const deadlineObj = new Date(registrationDeadline);
      
      if (deadlineObj >= startDateObj) {
        return res.status(400).json({ message: 'Registration deadline must be before start date' });
      }
    }
    
    // Check if increased capacity can accommodate existing registrations
    if (capacity) {
      const registrationCount = await Registration.countDocuments({
        eventId: event._id,
        status: { $in: ['registered', 'attended'] }
      });
      
      if (capacity < registrationCount) {
        return res.status(400).json({
          message: 'Cannot reduce capacity below current registration count',
          currentRegistrations: registrationCount
        });
      }
    }
    
    // Update event using Mongoose ORM
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        clubId: clubId || event.clubId,
        title: title || event.title,
        description: description || event.description,
        category: category || event.category,
        startDate: startDate || event.startDate,
        endDate: endDate || event.endDate,
        location: location || event.location,
        venue: venue || event.venue,
        capacity: capacity || event.capacity,
        registrationDeadline: registrationDeadline || event.registrationDeadline,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    // Update organizers if provided
    if (organizers && organizers.length > 0) {
      // Remove existing organizers
      await EventOrganizer.deleteMany({ eventId: event._id });
      
      // Add new organizers
      const organizerPromises = organizers.map(org => {
        return new EventOrganizer({
          eventId: event._id,
          userId: org.userId,
          role: org.role
        }).save();
      });
      
      await Promise.all(organizerPromises);
    }
    
    res.json(updatedEvent);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check authorization (only organizers with host role or admins can delete)
    const organizer = await EventOrganizer.findOne({
      eventId: event._id,
      userId: req.user.id,
      role: 'host'
    });
    
    if (!organizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    // Don't allow deleting events that have already happened
    if (event.status === 'completed') {
      return res.status(400).json({ message: 'Cannot delete a completed event' });
    }
    
    // Check if there are registrations
    const registrationCount = await Registration.countDocuments({ eventId: event._id });
    
    if (registrationCount > 0) {
      // Instead of deleting, mark as cancelled
      event.status = 'cancelled';
      await event.save();
      
      return res.json({ 
        message: 'Event marked as cancelled due to existing registrations',
        registrationCount
      });
    }
    
    // Delete event and all related records
    await Event.findByIdAndDelete(req.params.id);
    await EventOrganizer.deleteMany({ eventId: req.params.id });
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Manage event organizers
exports.manageEventOrganizers = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizers } = req.body;
    
    // Validate event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check authorization (only existing organizers or admins can modify)
    const isOrganizer = await EventOrganizer.isEventOrganizer(id, req.user.id);
    
    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to manage organizers for this event' });
    }
    
    // Clear existing organizers
    await EventOrganizer.deleteMany({ eventId: id });
    
    // Add new organizers
    const organizerPromises = organizers.map(org => {
      return new EventOrganizer({
        eventId: id,
        userId: org.userId,
        role: org.role
      }).save();
    });
    
    await Promise.all(organizerPromises);
    
    // Get updated organizers list with user details
    const updatedOrganizers = await EventOrganizer.find({ eventId: id })
      .populate('userId', 'firstName lastName email role');
    
    res.json(updatedOrganizers);
  } catch (err) {
    console.error('Error managing event organizers:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Using MongoDB Aggregation Pipeline (similar to prepared statements) - 20% of operations
// --------------------------------------------------------------------------------------

// Get dropdown data for event form (clubs, categories, venues)
exports.getEventFormData = async (req, res) => {
  try {
    // Using aggregation framework like a prepared statement for consistent data retrieval
    const clubsPromise = Club.aggregate([
      { $match: { active: true } },
      { $project: { _id: 1, name: 1, category: 1, departmentAffiliation: 1 } },
      { $sort: { name: 1 } }
    ]);
    
    // Using distinct as a simplified prepared query 
    const categoriesPromise = Event.distinct('category');
    
    // Using aggregation for venues with frequency count
    const venuesPromise = Event.aggregate([
      { $group: {
          _id: {
            building: '$venue.building',
            room: '$venue.room'
          },
          capacity: { $first: '$venue.capacity' },
          count: { $sum: 1 }
        }
      },
      { $project: {
          _id: 0,
          building: '$_id.building',
          room: '$_id.room',
          capacity: 1,
          useCount: '$count'
        }
      },
      { $sort: { useCount: -1 } }
    ]);
    
    // Using aggregation to get potential organizers (users who can organize events)
    const organizersPromise = User.aggregate([
      { $match: { role: { $in: ['clubOfficer', 'admin'] } } },
      { $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          role: 1,
          fullName: { $concat: ['$firstName', ' ', '$lastName'] }
        }
      },
      { $sort: { lastName: 1, firstName: 1 } }
    ]);
    
    // Execute all queries in parallel
    const [clubs, categories, venues, organizers] = await Promise.all([
      clubsPromise,
      categoriesPromise, 
      venuesPromise,
      organizersPromise
    ]);
    
    res.json({
      clubs,
      categories,
      venues,
      organizers
    });
  } catch (err) {
    console.error('Error fetching event form data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search events based on filters
exports.searchEvents = async (req, res) => {
  try {
    const { term, clubId, category, startDate, endDate, status } = req.query;
    
    // Build the query dynamically (aggregation pipeline as a prepared statement)
    const matchStage = {};
    
    if (term) {
      matchStage.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } }
      ];
    }
    
    if (clubId) {
      matchStage.clubId = new mongoose.Types.ObjectId(clubId);
    }
    
    if (category) {
      matchStage.category = category;
    }
    
    if (status) {
      matchStage.status = status;
    }
    
    // Date range filter
    if (startDate || endDate) {
      matchStage.startDate = {};
      
      if (startDate) {
        matchStage.startDate.$gte = new Date(startDate);
      }
      
      if (endDate) {
        matchStage.endDate = { $lte: new Date(endDate) };
      }
    }
    
    // Aggregation pipeline (equivalent to a parameterized prepared statement)
    const pipeline = [
      { $match: matchStage },
      { $lookup: {
          from: 'clubs',
          localField: 'clubId',
          foreignField: '_id',
          as: 'club'
        }
      },
      { $unwind: '$club' },
      { $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      { $unwind: '$creator' },
      { $project: {
          _id: 1,
          title: 1,
          description: 1,
          category: 1,
          startDate: 1,
          endDate: 1,
          location: 1,
          venue: 1,
          capacity: 1,
          status: 1,
          club: {
            _id: '$club._id',
            name: '$club.name',
            category: '$club.category'
          },
          creator: {
            _id: '$creator._id',
            name: { $concat: ['$creator.firstName', ' ', '$creator.lastName'] }
          }
        }
      },
      { $sort: { startDate: -1 } }
    ];
    
    const events = await Event.aggregate(pipeline);
    
    res.json(events);
  } catch (err) {
    console.error('Error searching events:', err);
    res.status(500).json({ message: 'Server error' });
  }
};