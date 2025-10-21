// frontend/src/App.jsx
import { Routes, Route, Link, useNavigate, Outlet, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './AuthContext'; // AuthContext က useAuth hook ကို import လုပ်ပါ

// Page Components တွေကို import လုပ်ပါ
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ChatRoomPage from './pages/ChatRoomPage';
import SettingsPage from './pages/SettingsPage';
import GuestLandingPage from './pages/GuestLandingPage'; // Guest Landing Page ကို ထည့်သွင်းထားပြီးသား

// --- Protected Route Component ---
// Login ဝင်ထားမှသာ ဝင်ခွင့်ပြုမယ့် Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // AuthContext က user နဲ့ loading state ကို ယူသုံးပါ

  if (loading) {
    return <div>Loading authentication...</div>; // Auth state စစ်နေတုန်း loading ပြပါ
  }

  if (!user) {
    return <Navigate to="/auth" replace />; // Login မဝင်ထားရင် Login Page ကို ပြန်ပို့ပါ
  }

  return children; // Login ဝင်ထားရင် Page ကို ပြသပါ
};
// --- End Protected Route Component ---

function App() {
  const { user, signOut, loading } = useAuth(); // AuthContext က user, signOut, loading ကို ယူသုံးပါ
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth'); // Logout ပြီးရင် Login Page ကို ပို့ပါ
    } catch (error) {
      console.error("Error signing out:", error.message);
      alert("Error signing out: " + error.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          {/* Logo/Brand Name */}
          <Link to={user ? "/dashboard" : "/auth"} style={{fontWeight: 'bold', fontSize: '1.2em', color: 'white', textDecoration: 'none'}}>Bridge AI</Link>

          {/* Navigation Links - Login Status ပေါ်မူတည်ပြီး ပြောင်းလဲပြသမည် */}
          {loading ? ( // Auth state စစ်နေတုန်း
            <span>Loading...</span>
          ) : user ? ( // User Login ဝင်ထားရင်
            <>
              <Link to="/dashboard">Dashboard</Link> |{' '}
              <Link to="/settings">Settings</Link> |{' '}
              <button onClick={handleLogout} style={{background: 'none', border: 'none', color: '#61dafb', cursor: 'pointer', fontSize: '1em', textDecoration: 'underline'}}>Logout</button>
            </>
          ) : ( // User Login မဝင်ထားရင်
            <>
              <Link to="/auth">Login / Register</Link>
            </>
          )}
          {/* Sample Chat Link (development အတွက်) */}
          {!loading && user && <Link to="/chat/sample-room-id" style={{marginLeft: '10px'}}>(Sample Chat)</Link>}
        </nav>
      </header>

      <main className="App-main">
        <Routes>
          {/* Public Routes (Login မဝင်ထားလည်း ဝင်လို့ရတဲ့ page တွေ) */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/join/:roomId" element={<GuestLandingPage />} /> {/* Guest တွေအတွက် Room Link */}

          {/* Protected Routes (Login ဝင်ထားမှသာ ဝင်ခွင့်ပြုမယ့် page တွေ) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:roomId"
            element={
              <ProtectedRoute>
                <ChatRoomPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found Page (optional) */}
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </main>

      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Bridge AI</p>
      </footer>
    </div>
  );
}

export default App;