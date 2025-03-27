import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    }
  });
  
  // Using const instead of useState to avoid unused setter warnings
  const clubs = [
    { _id: '1', name: 'Computer Science Club' },
    { _id: '2', name: 'Math Club' },
    { _id: '3', name: 'Psychology Society' }
  ];
  
  const categories = [
    'Workshop', 'Seminar', 'Study Group', 'Social Event', 'Meeting'
  ];
  
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  
  useEffect(() => {
    // If we have an ID, we're editing an existing event
    if (id) {
      setIsEdit(true);
      
      // In a real app, fetch the event data from API
      // For now, get events from localStorage
      const storedEvents = JSON.parse(localStorage.getItem('campusEvents') || '[]');
      const eventToEdit = storedEvents.find(event => event._id === id);
      
      if (eventToEdit) {
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
          ...eventToEdit,
          startDate: formatDateForInput(eventToEdit.startDate),
          endDate: formatDateForInput(eventToEdit.endDate)
        });
      }
    }
  }, [id]);
  
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
      setFormData(prev => ({
        ...prev,
        clubId: { name: selectedClub.name, _id: selectedClub._id }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = e => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.clubId._id || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      // Get existing events
      const storedEvents = JSON.parse(localStorage.getItem('campusEvents') || '[]');
      
      if (isEdit) {
        // Update existing event
        const updatedEvents = storedEvents.map(event => 
          event._id === id ? { ...formData } : event
        );
        localStorage.setItem('campusEvents', JSON.stringify(updatedEvents));
      } else {
        // Create new event with a random ID
        const newEvent = {
          ...formData,
          _id: Math.random().toString(36).substr(2, 9),
          status: 'upcoming'
        };
        localStorage.setItem('campusEvents', JSON.stringify([...storedEvents, newEvent]));
      }
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      setError('An error occurred while saving the event');
      console.error(error);
    }
  };
  
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;