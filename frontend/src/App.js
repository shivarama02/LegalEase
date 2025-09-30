import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import About from './pages/About';
import Contact from './pages/Contact';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import UserDashboard from './pages/user/Dashboard';
import LawyerDashboard from './pages/lawyer/Dashboard';
import LawyerLawInfo from './pages/lawyer/LawInfo';
import AdminDashboard from './pages/admin/Dashboard';
import LawInfo from './pages/user/LawInfo';
import LawyerChatAssistant from './pages/lawyer/ChatAssistant';
import LawyerProfile from './pages/lawyer/LawyerProfile';
import LawyerAppoinment from './pages/lawyer/AppointmentSchedule';
import LawyerFeedback from './pages/lawyer/Feedback'
import ComplaintGenerator from './pages/user/ComplaintGenerator';
import Complaints from './pages/user/Complaints';
import ComplaintPreview from './pages/user/ComplaintPreview';
import LawyerDirectory from './pages/user/LawyerDirectory';
import ChatAssistant from './pages/user/ChatAssistant';
import Notifications from './pages/user/Notifications';
import LawyerNotifications from './pages/lawyer/Notifications';
import Settings from './pages/user/Settings';
import UserProfile from './pages/user/UserProfile';
import UserAppointmentSchedule from './pages/user/AppointmentSchedule';
import LawyerProfileView from './pages/user/LawyerProfileView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/user/Dashboard" element={<UserDashboard />} />
            <Route path="/user/laws" element={<LawInfo />} />
            <Route path="/user/complaints" element={<Complaints />} />
            <Route path="/user/complaints/generator" element={<ComplaintGenerator />} />
            <Route path="/user/complaints/preview" element={<ComplaintPreview />} />
            <Route path="/user/lawyers" element={<LawyerDirectory />} />
            <Route path="/user/lawyers/:id" element={<LawyerProfileView />} />
            <Route path="/user/chat" element={<ChatAssistant />} />
            <Route path="/user/notifications" element={<Notifications />} />
            <Route path="/user/settings" element={<Settings />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/lawyer/Dashboard" element={<LawyerDashboard />} />
            <Route path="/lawyer/Laws" element={<LawyerLawInfo />} />
            <Route path="/lawyer/chat" element={<LawyerChatAssistant />} />
            <Route path="/lawyer/LawyerProfile" element={<LawyerProfile />} />
            <Route path="/lawyer/appointments" element={<LawyerAppoinment />} />
            <Route path="/user/appointments" element={<UserAppointmentSchedule />} />
            <Route path="/Lawyer/lawyerfeedback" element={<LawyerFeedback />} />
            <Route path="/Lawyer/lawyernotifications" element={<LawyerNotifications />} />
            {/* Aliases for lowercase lawyer paths used in sidebar */}
            <Route path="/lawyer/lawyerfeedback" element={<LawyerFeedback />} />
            <Route path="/lawyer/lawyernotifications" element={<LawyerNotifications />} />
            <Route path="/admin/Dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
