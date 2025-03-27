import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  // Format dates
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  // Calculate event duration
  const getDuration = () => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const diffMs = end - start;
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 1) {
      const diffMins = Math.round(diffHrs * 60);
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    }
    
    return `${Math.round(diffHrs * 10) / 10} hour${diffHrs !== 1 ? 's' : ''}`;
  };
  
  // Get status badge class
  const getStatusClass = () => {
    switch (event.status) {
      case 'upcoming': return 'status-upcoming';
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  return (
    <div className="event-card">
      <div className="event-card-header">
        <span className={`status-badge ${getStatusClass()}`}>
          {event.status}
        </span>
        
        {event.clubId && (
          <span className="club-label">
            {event.clubId.name}
          </span>
        )}
      </div>
      
      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>
        
        <div className="event-info">
          <div className="info-row">
            <span className="info-label">Category:</span>
            <span className="info-value">{event.category}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Date:</span>
            <span className="info-value">
              {formatDate(event.startDate)}
            </span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Duration:</span>
            <span className="info-value">{getDuration()}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Location:</span>
            <span className="info-value">
              {event.venue.building} - {event.venue.room}
            </span>
          </div>
          
          {event.registeredCount !== undefined && (
            <div className="info-row">
              <span className="info-label">Capacity:</span>
              <span className="info-value">
                {event.registeredCount}/{event.capacity} registered
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="event-card-footer">
        <Link to={`/events/${event._id}`} className="btn-view">
          View Details
        </Link>
        
        {event.status !== 'completed' && event.status !== 'cancelled' && (
          <Link to={`/events/edit/${event._id}`} className="btn-edit">
            Edit
          </Link>
        )}
      </div>
    </div>
  );
};

export default EventCard;