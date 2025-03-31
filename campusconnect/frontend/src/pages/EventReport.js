import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  
  // Change from constant to state
  const [clubs, setClubs] = useState([]);
  const [venues, setVenues] = useState([]);
  
  // Fetch clubs and venues from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clubs from API
        const clubsResponse = await axios.get('http://localhost:5001/api/clubs');
        console.log('Clubs fetched for report:', clubsResponse.data);
        
        if (clubsResponse.data && Array.isArray(clubsResponse.data)) {
          setClubs(clubsResponse.data);
        } else {
          // Fallback club data
          console.error('API response format incorrect');
          setClubs([
            { _id: '67e988e5d2130196d11add75', name: 'Computer Science Club' },
            { _id: '67e988e5d2130196d11add76', name: 'Math Club' },
            { _id: '67e988e5d2130196d11add77', name: 'Psychology Society' },
            { _id: '67e988e5d2130196d11add78', name: 'Photography Club' }
          ]);
        }
        
        // Get venues from existing events in localStorage
        const existingEvents = JSON.parse(localStorage.getItem('campusEvents') || '[]');
        const uniqueVenues = [];
        const venueMap = new Map();
        
        // Extract unique venues from events
        existingEvents.forEach(event => {
          const venueKey = `${event.venue.building}|${event.venue.room}`;
          if (!venueMap.has(venueKey)) {
            venueMap.set(venueKey, true);
            uniqueVenues.push({
              building: event.venue.building,
              room: event.venue.room
            });
          }
        });
        
        // If no venues found, provide defaults
        if (uniqueVenues.length === 0) {
          setVenues([
            { building: 'Science Building', room: '101' },
            { building: 'Science Building', room: '102' },
            { building: 'Math Building', room: '201' }
          ]);
        } else {
          setVenues(uniqueVenues);
        }
        
        setFetchingData(false);
      } catch (err) {
        console.error('Error fetching data for report:', err);
        // Fallback data
        setClubs([
          { _id: '67e988e5d2130196d11add75', name: 'Computer Science Club' },
          { _id: '67e988e5d2130196d11add76', name: 'Math Club' },
          { _id: '67e988e5d2130196d11add77', name: 'Psychology Society' },
          { _id: '67e988e5d2130196d11add78', name: 'Photography Club' }
        ]);
        setVenues([
          { building: 'Science Building', room: '101' },
          { building: 'Science Building', room: '102' },
          { building: 'Math Building', room: '201' }
        ]);
        setFetchingData(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleGenerateReport = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Get events from localStorage
      const allEvents = JSON.parse(localStorage.getItem('campusEvents') || '[]');
      
      // Filter events based on criteria
      let filteredEvents = [...allEvents];
      
      if (startDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.startDate) >= new Date(startDate)
        );
      }
      
      if (endDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.endDate) <= new Date(endDate + 'T23:59:59')
        );
      }
      
      if (selectedClub) {
        filteredEvents = filteredEvents.filter(event => 
          event.clubId._id === selectedClub
        );
      }
      
      if (selectedVenue) {
        const [building, room] = selectedVenue.split('|');
        filteredEvents = filteredEvents.filter(event => 
          event.venue.building === building && event.venue.room === room
        );
      }
      
      // Generate report statistics
      const reportStats = {
        totalEvents: filteredEvents.length,
        averageDuration: calculateAverageDuration(filteredEvents),
        eventsByCategory: countEventsByCategory(filteredEvents),
        clubParticipation: countEventsByClub(filteredEvents)
      };
      
      setReportData({
        events: filteredEvents,
        stats: reportStats
      });
      
      setLoading(false);
    }, 500);
  };
  
  const calculateAverageDuration = (events) => {
    if (events.length === 0) return 0;
    
    const totalDuration = events.reduce((sum, event) => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const durationHours = (end - start) / (1000 * 60 * 60);
      return sum + durationHours;
    }, 0);
    
    return (totalDuration / events.length).toFixed(1);
  };
  
  const countEventsByCategory = (events) => {
    const categories = {};
    
    events.forEach(event => {
      if (!categories[event.category]) {
        categories[event.category] = 0;
      }
      categories[event.category]++;
    });
    
    return categories;
  };
  
  const countEventsByClub = (events) => {
    const clubEvents = {};
    
    events.forEach(event => {
      if (!clubEvents[event.clubId.name]) {
        clubEvents[event.clubId.name] = 0;
      }
      clubEvents[event.clubId.name]++;
    });
    
    return clubEvents;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  if (fetchingData) {
    return <div className="text-center py-6">Loading report data...</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Event Reports</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Generate reports on events based on date range, club, and venue to track activity across campus.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Report Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="clubSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Club
              </label>
              <select
                id="clubSelect"
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Clubs</option>
                {clubs.map(club => (
                  <option key={club._id} value={club._id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="venueSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Venue
              </label>
              <select
                id="venueSelect"
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Venues</option>
                {venues.map((venue, index) => (
                  <option key={index} value={`${venue.building}|${venue.room}`}>
                    {venue.building} - {venue.room}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>
      
      {reportData && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Report Results</h2>
              <span className="text-sm text-gray-500">
                {reportData.events.length} events found
              </span>
            </div>
            
            {reportData.events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No events match the selected criteria.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-600 font-medium">Total Events</p>
                    <p className="text-3xl font-bold text-indigo-700">
                      {reportData.stats.totalEvents}
                    </p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-600 font-medium">Average Duration</p>
                    <p className="text-3xl font-bold text-indigo-700">
                      {reportData.stats.averageDuration} hours
                    </p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-600 font-medium">Most Active Category</p>
                    <p className="text-3xl font-bold text-indigo-700">
                      {Object.entries(reportData.stats.eventsByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <h3 className="text-md font-medium text-gray-700 mb-3">Events List</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Event</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Club</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Venue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.events.map(event => (
                        <tr key={event._id}>
                          <td className="px-3 py-4 text-sm text-gray-800 font-medium">{event.title}</td>
                          <td className="px-3 py-4 text-sm text-gray-500">{event.clubId.name}</td>
                          <td className="px-3 py-4 text-sm text-gray-500">{event.category}</td>
                          <td className="px-3 py-4 text-sm text-gray-500">{formatDate(event.startDate)}</td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {event.venue.building} - {event.venue.room}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Report generated on {new Date().toLocaleString()}
              </span>
              <button
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventReport;