import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto mt-12 text-center bg-white shadow rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;