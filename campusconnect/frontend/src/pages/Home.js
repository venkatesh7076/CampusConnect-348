import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/events/EventCard'; // This matches your structure

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5001/api';

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear localStorage to prevent any local data from interfering
      localStorage.removeItem('campusEvents');
      
      // Add cache-busting to avoid browser caching
      const timestamp = new Date().getTime();
      console.log(`HOME: Directly fetching events from ${API_BASE_URL}/events?t=${timestamp}`);
      
      const response = await axios.get(`${API_BASE_URL}/events?t=${timestamp}`);
      console.log('HOME: Raw API response:', response);
      
      if (response.status === 200 && Array.isArray(response.data)) {
        console.log(`HOME: Successfully fetched ${response.data.length} events from API`);
        setEvents(response.data);
      } else {
        console.error('HOME: API returned unexpected data format', response.data);
        setError('Failed to load events: Unexpected data format');
        setEvents([]);
      }
    } catch (err) {
      console.error('HOME: Error fetching events:', err);
      setError(`Failed to load events: ${err.message}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  // Listen for a refresh event from EventForm redirect
  useEffect(() => {
    const checkSessionStorage = () => {
      const shouldRefresh = sessionStorage.getItem('shouldRefreshEvents') === 'true';
      if (shouldRefresh) {
        console.log('HOME: Detected refresh flag - fetching fresh data');
        sessionStorage.removeItem('shouldRefreshEvents');
        fetchEvents();
      }
    };

    // Check when the component mounts
    checkSessionStorage();

    // Also set up a listener for "storage" events
    window.addEventListener('storage', checkSessionStorage);
    
    return () => {
      window.removeEventListener('storage', checkSessionStorage);
    };
  }, []);

  // Group events by status

  // Modified version to show all events for debugging
const upcomingEvents = events;

// Also add this debug code after fetching the events
console.log('ALL EVENTS FROM API:', events.map(event => ({
  id: event._id,
  title: event.title,
  status: event.status
})));

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading events...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">CampusConnect</h1>
        <p className="text-xl text-gray-600 mb-8">Your hub for university club events</p>
        
        <div className="flex justify-center space-x-4 mt-6">
          <Link 
            to="/events/create" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Event
          </Link>
          <Link 
            to="/reports/events" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Event Reports
          </Link>
        </div>
      </div>
      
      <div className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
          <button
            onClick={fetchEvents}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
            <button 
              onClick={fetchEvents}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        )}
        
        {upcomingEvents.length === 0 ? (
          <p className="text-center py-8 bg-gray-50 rounded-lg text-gray-500 italic">No events scheduled. Create an event to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <EventCard key={event._id || Math.random()} event={event} />
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-12">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome to CampusConnect</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-10">
            CampusConnect is the central hub for all university club events. 
            Browse upcoming events, register for workshops and seminars, or 
            create your own events if you're a club officer.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-indigo-600 mb-2">For Students</h3>
              <p className="text-gray-500 text-sm">Discover events that match your interests and register to attend.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-indigo-600 mb-2">For Club Officers</h3>
              <p className="text-gray-500 text-sm">Create and manage events for your club members and track attendance.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-indigo-600 mb-2">For Administrators</h3>
              <p className="text-gray-500 text-sm">Generate reports on event attendance and club activities across campus.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;