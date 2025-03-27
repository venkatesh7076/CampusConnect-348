import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString; // Fallback if date format is not correct
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="px-4 py-3 bg-indigo-50 flex justify-between">
        <span className="px-2 py-1 text-xs font-semibold bg-indigo-600 text-white rounded">
          {event.category}
        </span>
        <span className="text-xs text-gray-500 self-center">
          {event.clubId.name}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-4 overflow-hidden line-clamp-3">{event.description}</p>
        
        <div className="mb-4">
          <div className="flex mb-1">
            <span className="text-sm font-medium text-gray-700 w-16">When:</span>
            <span className="text-sm text-gray-600">{formatDate(event.startDate)}</span>
          </div>
          
          <div className="flex">
            <span className="text-sm font-medium text-gray-700 w-16">Where:</span>
            <span className="text-sm text-gray-600">
              {event.venue.building} - {event.venue.room}
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
        <Link 
          to={`/events/${event._id}`} 
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;