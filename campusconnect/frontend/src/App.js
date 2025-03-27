import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Components
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import EventForm from './pages/EventForm';
import EventDetail from './pages/EventDetail';
import EventReport from './pages/EventReport'; // Import the EventReport component
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events/create" element={<EventForm />} />
            <Route path="/events/edit/:id" element={<EventForm />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/reports/events" element={<EventReport />} /> {/* Add this route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <footer className="bg-white py-6 text-center text-gray-500 text-sm border-t border-gray-200">
          <p>© 2025 CampusConnect</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;