import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EventForm = () => {
  const [formData, setFormData] = useState({
    clubId: '',
    title: '',
    description: '',
    category: '',
    startDate: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    endDate: new Date().toISOString().split('T')[0],
    location: '',
    venue: {
      building: '',
      room: '',
      capacity: 30
    },
    capacity: 30
  });
  
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  
  // Simulate fetching clubs for dropdown
  useEffect(() => {
    // Mock data for clubs
    setClubs([
      { _id: '1', name: 'Computer Science Club', departmentAffiliation: 'CS' },
      { _id: '2', name: 'Math Club', departmentAffiliation: 'Mathematics' },
      { _id: '3', name: 'Psychology Society', departmentAffiliation: 'Psychology' }
    ]);
    
    if (id) {
      setIsEdit(true);
      // Mock data for editing
      setFormData({
        clubId: '1',
        title: 'Sample Event',
        description: 'This is a sample event description',
        category: 'Workshop',
        startDate: '2025-04-15',
        endDate: '2025-04-15',
        location: 'Main Campus',
        venue: {
          building: 'Science Building',
          room: '101',
          capacity: 50
        },
        capacity: 50
      });
    }
    
    setLoading(false);
  }, [id]);
  
  const handleChange = e => {
    const { name, value } = e.target;
    
    // Handle nested venue object fields
    if (name.startsWith('venue.')) {
      const venueField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        venue: {
          ...prev.venue,
          [venueField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      // Validate form
      if (!formData.clubId || !formData.title || !formData.description) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }
      
      // For demonstration, we'll just log the data and navigate
      console.log('Form data submitted:', formData);
      alert(isEdit ? 'Event updated successfully!' : 'Event created successfully!');
      
      // Redirect to events list
      navigate('/events');
    } catch (err) {
      console.error('Error saving event:', err);
      setErrorMsg('Failed to save event. Please try again.');
    }
  };
  
  if (loading) {
    return <div className="loading">Loading form data...</div>;
  }
  
  return (
    <div className="event-form-container">
      <h2>{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
      
      {errorMsg && <div className="error-message">{errorMsg}</div>}
      
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-section">
          <h3>Event Details</h3>
          
          <div className="form-group">
            <label htmlFor="clubId">Club*</label>
            <select
              id="clubId"
              name="clubId"
              value={formData.clubId}
              onChange={handleChange}
              required
            >
              <option value="">Select a Club</option>
              {clubs.map(club => (
                <option key={club._id} value={club._id}>
                  {club.name} ({club.departmentAffiliation})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="title">Event Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category*</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a Category</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Social">Social</option>
              <option value="Meeting">Meeting</option>
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Date & Time</h3>
          
          <div className="form-group">
            <label htmlFor="startDate">Start Date*</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">End Date*</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Location & Capacity</h3>
          
          <div className="form-group">
            <label htmlFor="location">Location Description*</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Main Campus"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="venue.building">Building*</label>
            <input
              type="text"
              id="venue.building"
              name="venue.building"
              value={formData.venue.building}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="venue.room">Room*</label>
            <input
              type="text"
              id="venue.room"
              name="venue.room"
              value={formData.venue.room}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="capacity">Maximum Capacity*</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/events')}>
            Cancel
          </button>
          <button type="submit" className="btn-save">
            {isEdit ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;