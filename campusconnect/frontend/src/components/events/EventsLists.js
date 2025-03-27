import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EventCard from './EventCard';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/api/events');
        setEvents(res.data);
        
        // Extract unique clubs and categories for filters
        const uniqueClubs = [...new Set(res.data.map(event => 
          JSON.stringify({ id: event.clubId._id, name: event.clubId.name })
        ))].map(club => JSON.parse(club));
        
        const uniqueCategories = [...new Set(res.data.map(event => event.category))];
        
        setClubs(uniqueClubs);
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  const handleSearch = async () => {
    setLoading(true);
    
    try {
      // Build query params for search
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('term', searchTerm);
      if (selectedClub) params.append('clubId', selectedClub);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const res = await axios.get(`/api/events/search?${params.toString()}`);
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error searching events:', err);
      setError('Failed to search events');
      setLoading(false);
    }
  };
  
  const resetFilters = () => {
    setSelectedClub('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSearchTerm('');
    
    // Refetch all events
    setLoading(true);
    axios.get('/api/events')
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setLoading(false);
      });
  };
  
  // Group events by status for display
  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const ongoingEvents = events.filter(event => event.status === 'ongoing');
  const completedEvents = events.filter(event => event.status === 'completed');
  const cancelledEvents = events.filter(event => event.status === 'cancelled');
  
  if (loading) {
    return <div className="loading">Loading events...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="events-list-container">
      <div className="events-header">
        <h1>Events Management</h1>
        <Link to="/events/create" className="btn-create">
          Create New Event
        </Link>
      </div>
      
      <div className="events-filters">
        <div className="filter-row">
          <div className="filter-group">
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <select 
              value={selectedClub} 
              onChange={(e) => setSelectedClub(e.target.value)}
            >
              <option value="">All Clubs</option>
              {clubs.map((club, index) => (
                <option key={index} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button onClick={handleSearch} className="btn-search">
            Search
          </button>
          <button onClick={resetFilters} className="btn-reset">
            Reset
          </button>
        </div>
      </div>
      
      {events.length === 0 ? (
        <div className="no-events">
          <p>No events found. Create your first event!</p>
        </div>
      ) : (
        <div className="events-grid">
          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <div className="events-section">
              <h2>Upcoming Events</h2>
              <div className="cards-grid">
                {upcomingEvents.map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {/* Ongoing Events Section */}
          {ongoingEvents.length > 0 && (
            <div className="events-section">
              <h2>Ongoing Events</h2>
              <div className="cards-grid">
                {ongoingEvents.map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {/* Completed Events Section */}
          {completedEvents.length > 0 && (
            <div className="events-section">
              <h2>Completed Events</h2>
              <div className="cards-grid">
                {completedEvents.map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {/* Cancelled Events Section */}
          {cancelledEvents.length > 0 && (
            <div className="events-section">
              <h2>Cancelled Events</h2>
              <div className="cards-grid">
                {cancelledEvents.map(event => (
                  <EventCard key={event._id} event={event} />
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