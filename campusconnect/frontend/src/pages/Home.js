
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching events
    setTimeout(() => {
      const mockEvents = [
        {
          _id: '1',
          title: 'Introduction to Python',
          description: 'Learn the basics of Python programming',
          status: 'upcoming',
          clubId: { name: 'Computer Science Club' },
          category: 'Workshop',
          startDate: '2025-04-15T14:00:00Z',
          endDate: '2025-04-15T16:00:00Z',
          venue: { building: 'Science Building', room: '101' }
        },
        {
          _id: '2',
          title: 'Data Structures Workshop',
          description: 'Deep dive into data structures and algorithms',
          status: 'upcoming',
          clubId: { name: 'Computer Science Club' },
          category: 'Workshop',
          startDate: '2025-04-22T13:00:00Z',
          endDate: '2025-04-22T15:30:00Z',
          venue: { building: 'Science Building', room: '102' }
        },
        {
          _id: '3',
          title: 'Calculus Study Group',
          description: 'Group study session for Calculus I',
          status: 'upcoming',
          clubId: { name: 'Math Club' },
          category: 'Study Group',
          startDate: '2025-04-18T15:00:00Z',
          endDate: '2025-04-18T17:00:00Z',
          venue: { building: 'Math Building', room: '201' }
        }
      ];
      
      setEvents(mockEvents);
      setLoading(false);
    }, 500);
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return <div className="loading">Loading events...</div>;
  }
  
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>CampusConnect</h1>
        <p>Your hub for university club events</p>
        
        <div className="header-actions">
          <Link to="/events/create" className="btn-create">
            Create Event
          </Link>
          <Link to="/reports/events" className="btn-report">
            Event Reports
          </Link>
        </div>
      </div>
      
      <div className="events-container">
        <h2>Upcoming Events</h2>
        
        <div className="events-grid">
          {events.map(event => (
            <div key={event._id} className="event-card">
              <div className="event-card-header">
                <span className="event-category">{event.category}</span>
                <span className="event-club">{event.clubId.name}</span>
              </div>
              
              <div className="event-card-body">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                
                <div className="event-details">
                  <div className="event-detail">
                    <span className="label">When:</span>
                    <span className="value">{formatDate(event.startDate)}</span>
                  </div>
                  
                  <div className="event-detail">
                    <span className="label">Where:</span>
                    <span className="value">{event.venue.building} - {event.venue.room}</span>
                  </div>
                </div>
              </div>
              
              <div className="event-card-footer">
                <Link to={`/events/${event._id}`} className="btn-view">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="home-info">
        <h2>Welcome to CampusConnect</h2>
        <p>
          CampusConnect is the central hub for all university club events. 
          Browse upcoming events, register for workshops and seminars, or 
          create your own events if you're a club officer.
        </p>
        
        <div className="info-features">
          <div className="feature">
            <h3>For Students</h3>
            <p>Discover events that match your interests and register to attend.</p>
          </div>
          
          <div className="feature">
            <h3>For Club Officers</h3>
            <p>Create and manage events for your club members and track attendance.</p>
          </div>
          
          <div className="feature">
            <h3>For Administrators</h3>
            <p>Generate reports on event attendance and club activities across campus.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
