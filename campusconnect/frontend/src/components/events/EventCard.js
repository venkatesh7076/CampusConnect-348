import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  // Debug the event data
  console.log("EventCard received event:", event);

  // Safe access to club name
  const getClubName = () => {
    if (!event.clubId) return "Unknown Club";

    // If it's a populated MongoDB object
    if (typeof event.clubId === "object" && event.clubId !== null) {
      // If it has a name property directly
      if (event.clubId.name) return event.clubId.name;

      // If it has _id but no name (not populated properly)
      if (event.clubId._id) return `Club ID: ${event.clubId._id}`;
    }

    // If it's just a string ID
    if (typeof event.clubId === "string") return `Club ID: ${event.clubId}`;

    return "Unknown Club";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Get venue string
  const getVenueString = () => {
    if (!event.venue) return "No venue information";
    return `${event.venue.building || "N/A"}, Room ${
      event.venue.room || "N/A"
    }`;
  };

  // Get status class for styling
  const getStatusClass = () => {
    switch (event.status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass()}`}
          >
            {event.status
              ? event.status.charAt(0).toUpperCase() + event.status.slice(1)
              : "Unknown"}
          </span>
          <span className="text-sm text-gray-500">{getClubName()}</span>
        </div>

        <h3 className="mt-3 text-lg leading-6 font-medium text-gray-900 truncate">
          {event.title || "Untitled Event"}
        </h3>

        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {event.description || "No description available"}
        </p>

        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <svg
              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{formatDate(event.startDate)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{getVenueString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="flex justify-between">
          <Link
            to={`/events/${event._id.toString()}`} // Ensure it's a string
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View Details →
          </Link>

          <Link
            to={`/events/edit/${event._id.toString()}`} // Ensure it's a string
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
