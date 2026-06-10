import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BiographyPage from './pages/BiographyPage';
import EducationCareerPage from './pages/EducationCareerPage';
import LeaderBeyondPoliticsPage from './pages/LeaderBeyondPoliticsPage';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import Gallery from './pages/Gallery';
import TimelineList from './pages/TimelineList';
import NewsList from './pages/NewsList';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

// A layout wrapper that decides whether to show Navbar/Footer
function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPath && <Navbar />}
      <main className="main-content-layout">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/biography" element={<BiographyPage />} />
          <Route path="/education-career" element={<EducationCareerPage />} />
          <Route path="/leader-beyond-politics" element={<LeaderBeyondPoliticsPage />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/timeline" element={<TimelineList />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
