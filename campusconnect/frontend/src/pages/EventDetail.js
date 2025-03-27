import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const EventDetail = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate API call to fetch event details
    setTimeout(() => {
      // Mock data for event details
      setEvent({
        _id: id,
        title: 'Sample Event',
        description: 'This is a detailed description of the sample event. It includes information about what attendees can expect, what they should bring, and other important details.',
        status: 'upcoming',
        clubId: {
          name: 'Computer Science Club',
          category: 'Academic'
        },
        category: 'Workshop',
        startDate: '2025-04-15T14:00:00Z',
        endDate: '2025-04-15T16:00:00Z',
        location: 'Main Campus',
        venue: {
          building: 'Science Building',
          room: '101'
        },
        capacity: 50,
        registeredCount: 30,
        availableSpots: 20
      });
      
      setLoading(false);
    }, 500);
  }, [id]);
  
  // Format dates for display
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  const handleDeleteEvent = () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      // Simulate API call to delete event
      alert('Event deleted successfully');
      navigate('/events');
    }
  };
  
  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!event) {
    return <div className="not-found">Event not found</div>;
  }
  
  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <div className="header-content">
          <h1>{event.title}</h1>
          <span className={`status-badge status-${event.status}`}>{event.status}</span>
        </div>
        
        <div className="header-actions">
          <Link to={`/events/edit/${event._id}`} className="btn-edit">
            Edit Event
          </Link>
          <button onClick={handleDeleteEvent} className="btn-delete">
            Delete Event
          </button>
          <Link to="/events" className="btn-back">
            Back to Events
          </Link>
        </div>
      </div>
      
      <div className="event-detail-content">
        <div className="event-detail-main">
          <section className="event-section">
            <h2>Event Details</h2>
            <div className="event-info-grid">
              <div className="info-item">
                <span className="label">Club</span>
                <span className="value">{event.clubId.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Category</span>
                <span className="value">{event.category}</span>
              </div>
              <div className="info-item">
                <span className="label">Start Date & Time</span>
                <span className="value">{formatDate(event.startDate)}</span>
              </div>
              <div className="info-item">
                <span className="label">End Date & Time</span>
                <span className="value">{formatDate(event.endDate)}</span>
              </div>
              <div className="info-item">
                <span className="label">Location</span>
                <span className="value">{event.location}</span>
              </div>
              <div className="info-item">
                <span className="label">Venue</span>
                <span className="value">{event.venue.building} - {event.venue.room}</span>
              </div>
              <div className="info-item">
                <span className="label">Capacity</span>
                <span className="value">
                  {event.registeredCount}/{event.capacity} registered
                  ({event.availableSpots} spots available)
                </span>
              </div>
            </div>
          </section>
          
          <section className="event-section">
            <h2>Description</h2>
            <p className="event-description">{event.description}</p>
          </section>
          
          <section className="event-section">
            <h2>Organizers</h2>
            <p>This event is organized by the {event.clubId.name}.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;