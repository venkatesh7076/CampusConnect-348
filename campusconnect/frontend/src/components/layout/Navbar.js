import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-indigo-600 text-xl font-bold">CampusConnect</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Home
              </Link>
              <Link
                to="/events/create"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Create Event
              </Link>
              <Link
                to="/reports/events"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Event Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;