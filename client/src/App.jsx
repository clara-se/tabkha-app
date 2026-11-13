import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RecipesPage from './pages/RecipesPage.jsx';
import PantryPage from './pages/PantryPage.jsx';

function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { token, logout } = useAuth();
  return (
    <>
      {token && (
        <nav>
          <Link to="/" className="nav-brand">
            Tabkha <span lang="ar">طبخة</span>
          </Link>
          <Link to="/">Recipes</Link>
          <Link to="/pantry">Pantry</Link>
          <button onClick={logout}>Log out</button>
        </nav>
      )}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Protected><RecipesPage /></Protected>} />
        <Route path="/pantry" element={<Protected><PantryPage /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}