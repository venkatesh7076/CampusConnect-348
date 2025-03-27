const Event = require('../models/Event');
const Registration = require('../models/Registration');
const mongoose = require('mongoose');

// Generate event report using MongoDB Aggregation Pipeline (prepared statement equivalent)
exports.generateEventReport = async (req, res) => {
  try {
    // Extract filter parameters
    const { startDate, endDate, clubId, venueBuilding, venueRoom } = req.query;
    
    // Build match stage for filtering events
    const matchStage = {};
    
    // Date filter
    if (startDate || endDate) {
      matchStage.startDate = {};
      
      if (startDate) {
        matchStage.startDate.$gte = new Date(startDate);
      }
      
      if (endDate) {
        matchStage.endDate = { $lte: new Date(endDate) };
      }
    }
    
    // Club filter
    if (clubId) {
      matchStage.clubId = new mongoose.Types.ObjectId(clubId);
    }
    
    // Venue filter
    if (venueBuilding || venueRoom) {
      if (venueBuilding) {
        matchStage['venue.building'] = venueBuilding;
      }
      
      if (venueRoom) {
        matchStage['venue.room'] = venueRoom;
      }
    }
    
    // Only include completed events
    matchStage.status = { $in: ['completed', 'ongoing'] };
    
    // Aggregation pipeline (equivalent to a prepared statement in SQL)
    const eventsPipeline = [
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
          from: 'registrations',
          let: { eventId: '$_id' },
          pipeline: [
            { $match: {
                $expr: {
                  $and: [
                    { $eq: ['$eventId', '$$eventId'] },
                    { $in: ['$status', ['registered', 'attended']] }
                  ]
                }
              }
            },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          as: 'registrationStats'
        }
      },
      { $addFields: {
          registrationCount: {
            $reduce: {
              input: '$registrationStats',
              initialValue: 0,
              in: {
                $cond: [
                  { $in: ['$$this._id', ['registered', 'attended']] },
                  { $add: ['$$value', '$$this.count'] },
                  '$$value'
                ]
              }
            }
          },
          attendanceCount: {
            $reduce: {
              input: '$registrationStats',
              initialValue: 0,
              in: {
                $cond: [
                  { $eq: ['$$this._id', 'attended'] },
                  { $add: ['$$value', '$$this.count'] },
                  '$$value'
                ]
              }
            }
          }
        }
      },
      { $project: {
          _id: 1,
          title: 1,
          startDate: 1,
          endDate: 1,
          capacity: 1,
          status: 1,
          club: {
            _id: '$club._id',
            name: '$club.name'
          },
          venue: 1,
          registrationCount: 1,
          attendanceCount: 1,
          duration: {
            $divide: [
              { $subtract: ['$endDate', '$startDate'] },
              3600000 // Convert milliseconds to hours
            ]
          }
        }
      },
      { $sort: { startDate: -1 } }
    ];
    
    // Execute the events pipeline
    const events = await Event.aggregate(eventsPipeline);
    
    // Calculate summary statistics
    const totalEvents = events.length;
    
    if (totalEvents === 0) {
      return res.json({
        events: [],
        summary: {
          totalEvents: 0,
          averageDuration: 0,
          averageRegistrations: 0,
          averageAttendance: 0,
          averageAttendanceRate: 0
        }
      });
    }
    
    const totalDuration = events.reduce((sum, event) => sum + event.duration, 0);
    const totalRegistrations = events.reduce((sum, event) => sum + event.registrationCount, 0);
    const totalAttendance = events.reduce((sum, event) => sum + event.attendanceCount, 0);
    
    const summary = {
      totalEvents,
      averageDuration: totalDuration / totalEvents,
      averageRegistrations: totalRegistrations / totalEvents,
      averageAttendance: totalAttendance / totalEvents,
      averageAttendanceRate: totalRegistrations > 0 ? totalAttendance / totalRegistrations : 0
    };
    
    res.json({
      events,
      summary
    });
  } catch (err) {
    console.error('Error generating event report:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all venues for the report filter dropdown
exports.getVenues = async (req, res) => {
  try {
    // Aggregation pipeline to get unique venues
    const pipeline = [
      { $group: {
          _id: {
            building: '$venue.building',
            room: '$venue.room'
          },
          count: { $sum: 1 }
        }
      },
      { $project: {
          _id: 0,
          building: '$_id.building',
          room: '$_id.room',
          count: 1
        }
      },
      { $sort: { building: 1, room: 1 } }
    ];
    
    const venues = await Event.aggregate(pipeline);
    res.json(venues);
  } catch (err) {
    console.error('Error fetching venues:', err);
    res.status(500).json({ message: 'Server error' });
  }
};