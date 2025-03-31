import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EventForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    clubId: { name: '', _id: '' },
    startDate: '',
    endDate: '',
    venue: {
      building: '',
      room: ''
    },
    location: '',
    capacity: 10,
    registrationDeadline: ''
  });
  
  const [clubs, setClubs] = useState([]);
  
  const categories = [
    'Workshop', 'Seminar', 'Study Group', 'Social Event', 'Meeting'
  ];
  
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  
  useEffect(() => {
    // Fetch clubs from database
    const fetchClubs = async () => {
      try {
        console.log('Fetching clubs from API...');
        
        const response = await axios.get('http://localhost:5001/api/clubs');
        console.log('Clubs API response:', response);
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Setting clubs from API:', response.data);
          setClubs(response.data);
        } else {
          console.error('API response is not an array:', response.data);
          setApiError('API response format is incorrect');
          
          // Fallback data
          setClubs([
            { _id: '67e988e5d2130196d11add75', name: 'Computer Science Club' },
            { _id: '67e988e5d2130196d11add76', name: 'Math Club' },
            { _id: '67e988e5d2130196d11add77', name: 'Psychology Society' },
            { _id: '67e988e5d2130196d11add78', name: 'Photography Club' }
          ]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setApiError(`API error: ${err.message}`);
        
        // Fallback data
        setClubs([
          { _id: '67e988e5d2130196d11add75', name: 'Computer Science Club' },
          { _id: '67e988e5d2130196d11add76', name: 'Math Club' },
          { _id: '67e988e5d2130196d11add77', name: 'Psychology Society' },
          { _id: '67e988e5d2130196d11add78', name: 'Photography Club' }
        ]);
        
        setLoading(false);
      }
    };

    fetchClubs();
    
    // If we have an ID, we're editing an existing event
    if (id) {
      setIsEdit(true);
      fetchEventById(id);
    }
  }, [id]);
  
  // Fetch event by ID from MongoDB
  const fetchEventById = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/events/${eventId}`);
      
      if (response.data) {
        // Format dates for input fields
        const formatDateForInput = (dateString) => {
          try {
            const date = new Date(dateString);
            return date.toISOString().split('.')[0].slice(0, -3); // Format for datetime-local input
          } catch {
            return '';
          }
        };
        
        setFormData({
          ...response.data,
          startDate: formatDateForInput(response.data.startDate),
          endDate: formatDateForInput(response.data.endDate)
        });
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(`Failed to load event data: ${err.message}`);
    }
  };
  
  const handleChange = e => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'clubId') {
      // Find the selected club
      const selectedClub = clubs.find(club => club._id === value);
      if (selectedClub) {
        setFormData(prev => ({
          ...prev,
          clubId: { name: selectedClub.name, _id: selectedClub._id }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.clubId._id || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      // Log what we're about to send to help with debugging
      console.log('Submitting event data:', JSON.stringify(formData, null, 2));
      
      let response;
      
      // Prepare data according to the expected schema
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        clubId: formData.clubId._id, // Send just the ID, not the object
        startDate: formData.startDate,
        endDate: formData.endDate,
        venue: formData.venue,
        location: formData.location || `${formData.venue.building}, ${formData.venue.room}`, // Default to building+room if not specified
        capacity: formData.capacity || 10, // Default capacity
        registrationDeadline: formData.registrationDeadline || new Date(new Date(formData.startDate).getTime() - 24*60*60*1000).toISOString(), // Default to 1 day before event
        status: 'upcoming'
      };
      
      console.log('Prepared event data:', JSON.stringify(eventData, null, 2));
      
      // Get auth token - you'll need to implement user auth and store the token
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      if (isEdit) {
        // Update existing event in MongoDB
        console.log(`Sending PUT request to http://localhost:5001/api/events/${id}`);
        response = await axios.put(
          `http://localhost:5001/api/events/${id}`, 
          eventData,
          { headers }
        );
        console.log('Update response:', response.data);
      } else {
        // Create new event in MongoDB
        console.log('Sending POST request to http://localhost:5001/api/events');
        response = await axios.post(
          'http://localhost:5001/api/events', 
          eventData,
          { headers }
        );
        console.log('Create response:', response.data);
      }
      
      // Make sure we got a successful response before redirecting
      if (response && response.status >= 200 && response.status < 300) {
        // Set flag to force refresh events list when redirected to home page
        sessionStorage.setItem('shouldRefreshEvents', 'true');
        
        // This event triggers the listener in the Home component
        window.dispatchEvent(new Event('storage'));
        
        // Redirect to home page - USING DIRECT WINDOW NAVIGATION to completely reset the page
        console.log('Event saved successfully, forcing page reload to show new event');
        window.location.href = '/';
      } else {
        setError(`Unexpected response: ${response ? response.status : 'No response'}`);
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
      console.error('Form submission error:', err);
      
      // Log more detailed error information
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        
        // Set a more informative error message
        setError(`Server error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response received from the server. Please check your backend connection.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-6">Loading form data...</div>;
  }
  
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {apiError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  API Error: {apiError}. Using fallback data.
                </p>
              </div>
            </div>
          </div>
        )}
        
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="clubId" className="block text-sm font-medium text-gray-700 mb-1">
                Hosting Club*
              </label>
              <select
                id="clubId"
                name="clubId"
                value={formData.clubId._id}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select a Club</option>
                {clubs.map(club => (
                  <option key={club._id} value={club._id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select a Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time*
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time*
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="venue.building" className="block text-sm font-medium text-gray-700 mb-1">
                Building*
              </label>
              <input
                type="text"
                id="venue.building"
                name="venue.building"
                value={formData.venue.building}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="venue.room" className="block text-sm font-medium text-gray-700 mb-1">
                Room*
              </label>
              <input
                type="text"
                id="venue.room"
                name="venue.room"
                value={formData.venue.room}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location Description*
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g. Main Campus, North Entrance"
                required
              />
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                Capacity*
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
              Registration Deadline*
            </label>
            <input
              type="datetime-local"
              id="registrationDeadline"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {submitLoading ? (
                <span>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isEdit ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;