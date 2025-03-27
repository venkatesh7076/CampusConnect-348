import React, { useState } from 'react';

const EventOrganizersList = ({ 
  organizers, 
  availableOrganizers, 
  onAdd, 
  onRemove, 
  onUpdateRole 
}) => {
  const [selectedOrganizer, setSelectedOrganizer] = useState('');
  const [selectedRole, setSelectedRole] = useState('helper');

  // Filter out organizers who are already added
  const filteredAvailableOrganizers = availableOrganizers.filter(
    organizer => !organizers.some(o => o.userId === organizer._id)
  );

  const handleAddOrganizer = () => {
    if (!selectedOrganizer) return;

    const organizer = availableOrganizers.find(o => o._id === selectedOrganizer);
    if (!organizer) return;

    onAdd({
      userId: organizer._id,
      role: selectedRole,
      name: organizer.fullName || `${organizer.firstName} ${organizer.lastName}`
    });

    // Reset selection
    setSelectedOrganizer('');
    setSelectedRole('helper');
  };

  return (
    <div className="event-organizers-list">
      <div className="organizer-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="organizerSelect">Add Organizer</label>
            <select
              id="organizerSelect"
              value={selectedOrganizer}
              onChange={(e) => setSelectedOrganizer(e.target.value)}
            >
              <option value="">Select a person</option>
              {filteredAvailableOrganizers.map(organizer => (
                <option key={organizer._id} value={organizer._id}>
                  {organizer.fullName || `${organizer.firstName} ${organizer.lastName}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="roleSelect">Role</label>
            <select
              id="roleSelect"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="host">Host</option>
              <option value="co-host">Co-Host</option>
              <option value="helper">Helper</option>
            </select>
          </div>

          <button 
            type="button" 
            className="btn-add" 
            onClick={handleAddOrganizer} 
            disabled={!selectedOrganizer}
          >
            Add
          </button>
        </div>
      </div>

      {organizers.length === 0 ? (
        <p className="no-organizers">No organizers added yet. Add at least one host for this event.</p>
      ) : (
        <table className="organizers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizers.map((organizer, index) => (
              <tr key={index}>
                <td>{organizer.name}</td>
                <td>
                  <select 
                    value={organizer.role} 
                    onChange={(e) => onUpdateRole(index, e.target.value)}
                  >
                    <option value="host">Host</option>
                    <option value="co-host">Co-Host</option>
                    <option value="helper">Helper</option>
                  </select>
                </td>
                <td>
                  <button 
                    type="button" 
                    className="btn-remove" 
                    onClick={() => onRemove(index)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EventOrganizersList;