import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
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
  const [routeLoading, setRouteLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  React.useEffect(() => {
    if (location.pathname !== prevPath) {
      // Trigger loader on route changes (unless it's admin path)
      if (!location.pathname.startsWith('/admin') && !prevPath.startsWith('/admin')) {
        setRouteLoading(true);
        window.scrollTo(0, 0);
      }
      setPrevPath(location.pathname);
    }
  }, [location.pathname, prevPath]);

  return (
    <>
      {routeLoading && (
        <PageLoader
          minDuration={1200}
          onDone={() => setRouteLoading(false)}
        />
      )}
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
  const [loading, setLoading] = useState(true);

  return (
    <>
      {/* Full-screen intro loader — shown once on app boot */}
      {loading && (
        <PageLoader
          minDuration={2000}
          onDone={() => setLoading(false)}
        />
      )}

      {/* Main app — rendered underneath so it's ready instantly after loader */}
      <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
        <Router>
          <AppContent />
        </Router>
      </div>
    </>
  );
}

export default App;
