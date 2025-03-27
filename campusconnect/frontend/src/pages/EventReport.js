
import React, { useState, useEffect } from 'react';

const EventReport = () => {
  // Report filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  
  // Data states
  const [clubs, setClubs] = useState([]);
  const [venues, setVenues] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  // Initialize with mock data
  useEffect(() => {
    // Mock data for clubs
    setClubs([
      { _id: '1', name: 'Computer Science Club' },
      { _id: '2', name: 'Math Club' },
      { _id: '3', name: 'Psychology Society' }
    ]);
    
    // Mock data for venues
    setVenues([
      { building: 'Science Building', room: '101' },
      { building: 'Library', room: '201' },
      { building: 'Student Center', room: 'A120' }
    ]);
    
    // Set default dates (last month to now)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    setStartDate(lastMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);
  
  // Handle report generation
  const generateReport = () => {
    setLoading(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // Mock report data
      setReportData({
        events: [
          {
            _id: '1',
            title: 'Introduction to Python',
            club: { name: 'Computer Science Club' },
            startDate: '2025-03-15T14:00:00Z',
            endDate: '2025-03-15T16:00:00Z',
            registrationCount: 42,
            attendanceCount: 35
          },
          {
            _id: '2',
            title: 'Data Structures Workshop',
            club: { name: 'Computer Science Club' },
            startDate: '2025-03-22T13:00:00Z',
            endDate: '2025-03-22T15:30:00Z',
            registrationCount: 38,
            attendanceCount: 30
          },
          {
            _id: '3',
            title: 'Calculus Study Group',
            club: { name: 'Math Club' },
            startDate: '2025-03-18T15:00:00Z',
            endDate: '2025-03-18T17:00:00Z',
            registrationCount: 25,
            attendanceCount: 22
          }
        ],
        summary: {
          totalEvents: 3,
          averageDuration: 2.5,
          averageRegistrations: 35,
          averageAttendance: 29,
          averageAttendanceRate: 0.83
        }
      });
      
      setReportGenerated(true);
      setLoading(false);
    }, 1000);
  };
  
  const resetFilters = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    setStartDate(lastMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setSelectedClub('');
    setSelectedVenue('');
    setReportGenerated(false);
    setReportData(null);
  };
  
  // Format dates for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Calculate duration in hours
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    return (diffMs / (1000 * 60 * 60)).toFixed(1);
  };
  
  // Calculate attendance rate
  const calculateAttendanceRate = (attended, registered) => {
    if (!registered) return '0%';
    return `${Math.round((attended / registered) * 100)}%`;
  };
  
  return (
    <div className="report-container">
      <h1>Event Report</h1>
      
      <div className="report-filters">
        <div className="filter-section">
          <h2>Filter Events</h2>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="clubSelect">Club</label>
              <select
                id="clubSelect"
                value={selectedClub}
                onChange={e => setSelectedClub(e.target.value)}
              >
                <option value="">All Clubs</option>
                {clubs.map(club => (
                  <option key={club._id} value={club._id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="venueSelect">Venue</label>
              <select
                id="venueSelect"
                value={selectedVenue}
                onChange={e => setSelectedVenue(e.target.value)}
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
          
          <div className="filter-actions">
            <button onClick={generateReport} className="btn-generate">
              Generate Report
            </button>
            <button onClick={resetFilters} className="btn-reset">
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {loading && <div className="loading">Generating report...</div>}
      
      {reportGenerated && reportData && (
        <div className="report-results">
          <div className="report-header">
            <h2>Event Report Results</h2>
            <div className="report-meta">
              <p>
                <strong>Period:</strong> {formatDate(startDate)} to {formatDate(endDate)}
              </p>
              {selectedClub && (
                <p>
                  <strong>Club:</strong> {clubs.find(c => c._id === selectedClub)?.name || 'All Clubs'}
                </p>
              )}
              {selectedVenue && (
                <p>
                  <strong>Venue:</strong> {selectedVenue.replace('|', ' - ')}
                </p>
              )}
              <p>
                <strong>Total Events:</strong> {reportData.events.length}
              </p>
            </div>
          </div>
          
          <div className="report-summary">
            <h3>Summary Statistics</h3>
            <div className="summary-stats">
              <div className="stat-card">
                <div className="stat-value">{reportData.summary.averageDuration.toFixed(1)}</div>
                <div className="stat-label">Avg. Duration (hours)</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{reportData.summary.averageRegistrations.toFixed(0)}</div>
                <div className="stat-label">Avg. Registrations</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{reportData.summary.averageAttendance.toFixed(0)}</div>
                <div className="stat-label">Avg. Attendance</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{(reportData.summary.averageAttendanceRate * 100).toFixed(0)}%</div>
                <div className="stat-label">Avg. Attendance Rate</div>
              </div>
            </div>
          </div>
          
          <div className="events-table-container">
            <h3>Events</h3>
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Club</th>
                  <th>Date</th>
                  <th>Duration (hrs)</th>
                  <th>Registrations</th>
                  <th>Attendance</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.events.map(event => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>{event.club.name}</td>
                    <td>{formatDate(event.startDate)}</td>
                    <td>{calculateDuration(event.startDate, event.endDate)}</td>
                    <td>{event.registrationCount}</td>
                    <td>{event.attendanceCount}</td>
                    <td>{calculateAttendanceRate(event.attendanceCount, event.registrationCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="report-actions">
            <button className="btn-export">Export to CSV</button>
            <button className="btn-print">Print Report</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventReport;