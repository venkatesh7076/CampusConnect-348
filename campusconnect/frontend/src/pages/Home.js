import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/events/EventCard'; // Ensure this matches your structure

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    // For now we'll use localStorage to persist events between refreshes
    const storedEvents = localStorage.getItem('campusEvents');
    const initialEvents = storedEvents ? JSON.parse(storedEvents) : [
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
    
    setEvents(initialEvents);
    setLoading(false);
    
    // Save the initial events to localStorage if they don't exist
    if (!storedEvents) {
      localStorage.setItem('campusEvents', JSON.stringify(initialEvents));
    }
  }, []);

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
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Upcoming Events</h2>
        
        {events.length === 0 ? (
          <p className="text-center py-8 bg-gray-50 rounded-lg text-gray-500 italic">No events scheduled. Create an event to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event._id} event={event} />
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