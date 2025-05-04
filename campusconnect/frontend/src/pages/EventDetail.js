import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const EventDetail = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        navigate('/');
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event. Please try again later.');
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString; // Fallback if date format is not correct
    }
  };
  
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading event details...</div>;
  }
  
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Event</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Home
        </Link>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h1>
        <div className="flex items-center space-x-4">
          <span className="px-2 py-1 text-xs font-semibold bg-indigo-600 text-white rounded">
            {event.category}
          </span>
          <span className="text-sm text-gray-600">
            Hosted by {typeof event.clubId === 'object' && event.clubId && event.clubId.name 
              ? event.clubId.name 
              : 'Unknown Club'}
          </span>
        </div>
      </div>
      
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-indigo-600 mb-2">Date & Time</h3>
            <p className="text-gray-600 mb-1">{formatDate(event.startDate)}</p>
            <p className="text-gray-600 mb-1">to</p>
            <p className="text-gray-600">{formatDate(event.endDate)}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-indigo-600 mb-2">Location</h3>
            <p className="text-gray-600">
              {event.venue ? `${event.venue.building}, Room ${event.venue.room}` : event.location}
            </p>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-indigo-600 mb-3">Description</h3>
          <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Events
        </Link>
        
        <div className="space-x-3">
          <Link 
            to={`/events/edit/${event._id}`} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Event
          </Link>
          
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;