import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EventCard from './EventCard';

// The key change is that we're now receiving events as props from the parent
const EventsList = ({ events = [], loading = false, refreshEvents }) => {
  // Filter states
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Base URL for API requests
  const API_BASE_URL = 'http://localhost:5001/api';
  
  // Process events whenever the props change
  useEffect(() => {
    console.log('EventsList received events from parent:', events);
    
    // Set filtered events to all events initially
    setFilteredEvents(events);
    
    // Extract unique clubs and categories from events
    if (Array.isArray(events) && events.length > 0) {
      const uniqueClubs = [];
      const uniqueCategories = new Set();
      
      events.forEach(event => {
        // Handle clubId that might be an object or just an ID
        if (event.clubId) {
          // If clubId is an object with _id and name
          if (typeof event.clubId === 'object' && event.clubId._id) {
            const clubExists = uniqueClubs.some(club => 
              club.id === event.clubId._id
            );
            
            if (!clubExists) {
              uniqueClubs.push({ 
                id: event.clubId._id, 
                name: event.clubId.name || 'Unknown Club'
              });
            }
          } else if (typeof event.clubId === 'string') {
            // If clubId is just an ID string
            const clubExists = uniqueClubs.some(club => club.id === event.clubId);
            
            if (!clubExists) {
              uniqueClubs.push({ 
                id: event.clubId, 
                name: `Club ${uniqueClubs.length + 1}` // Placeholder name
              });
            }
          }
        }
        
        // Add category if exists
        if (event.category) {
          uniqueCategories.add(event.category);
        }
      });
      
      if (uniqueClubs.length > 0) {
        setClubs(uniqueClubs);
      }
      
      setCategories([...uniqueCategories]);
    }
  }, [events]);
  
  // Handle filtering events when filter criteria change
  useEffect(() => {
    let results = [...events];
    
    if (selectedClub) {
      results = results.filter(event => {
        if (typeof event.clubId === 'object' && event.clubId._id) {
          return event.clubId._id === selectedClub;
        } else if (typeof event.clubId === 'string') {
          return event.clubId === selectedClub;
        }
        return false;
      });
    }
    
    if (selectedCategory) {
      results = results.filter(event => event.category === selectedCategory);
    }
    
    if (selectedStatus) {
      results = results.filter(event => event.status === selectedStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(event => 
        (event.title && event.title.toLowerCase().includes(term)) || 
        (event.description && event.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredEvents(results);
  }, [events, selectedClub, selectedCategory, selectedStatus, searchTerm]);
  
  // Handle search button click
  const handleSearch = () => {
    // This will trigger the useEffect above
    console.log('Search applied with criteria:', {
      club: selectedClub,
      category: selectedCategory,
      status: selectedStatus,
      term: searchTerm
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedClub('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSearchTerm('');
    setFilteredEvents(events);
  };
  
  // Group events by status
  const upcomingEvents = filteredEvents.filter(event => event.status === 'upcoming');
  const ongoingEvents = filteredEvents.filter(event => event.status === 'ongoing');
  const completedEvents = filteredEvents.filter(event => event.status === 'completed');
  const cancelledEvents = filteredEvents.filter(event => event.status === 'cancelled');
  
  // Debug events
  console.log('Events by status after filtering:', {
    upcoming: upcomingEvents.length,
    ongoing: ongoingEvents.length,
    completed: completedEvents.length,
    cancelled: cancelledEvents.length
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={refreshEvents}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link 
            to="/events/create" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Event
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg mb-8 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <select 
              value={selectedClub} 
              onChange={(e) => setSelectedClub(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Clubs</option>
              {clubs.map((club, index) => (
                <option key={index} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={handleSearch} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Search
          </button>
          <button 
            onClick={resetFilters} 
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
          <div className="mt-6">
            <Link
              to="/events/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Event
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events ({upcomingEvents.length})</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map(event => (
                  <EventCard key={event._id || `event-${Math.random()}`} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {/* Ongoing Events Section */}
          {ongoingEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ongoing Events</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ongoingEvents.map(event => (
                  <EventCard key={event._id || `event-${Math.random()}`} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {/* Completed Events Section */}
          {completedEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Completed Events</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completedEvents.map(event => (
                  <EventCard key={event._id || `event-${Math.random()}`} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {/* Cancelled Events Section */}
          {cancelledEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cancelled Events</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cancelledEvents.map(event => (
                  <EventCard key={event._id || `event-${Math.random()}`} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsList;