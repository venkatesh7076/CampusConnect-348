import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import EventReport from './pages/EventReport';
import NotFound from './pages/NotFound';
import EventForm from './pages/EventForm'; // Move EventForm to pages instead

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            {/* Home page */}
            <Route path="/" element={<Home />} />
            
            {/* Event management routes - Requirement 1 */}
            <Route path="/events" element={<Home />} /> {/* Use Home as events list for now */}
            <Route path="/events/create" element={<EventForm />} />
            <Route path="/events/edit/:id" element={<EventForm />} />
            <Route path="/events/:id" element={<EventDetail />} />
            
            {/* Event report route - Requirement 2 */}
            <Route path="/reports/events" element={<EventReport />} />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;