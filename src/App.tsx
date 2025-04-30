import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Alerts from './components/Alerts';
import CustomerService from './components/CustomerService';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      <div className="p-4">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-blue-800 drop-shadow-lg">
          Nova Salud - Sistema de Gestión
        </h1>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <div>
                  <nav>
                    <button onClick={handleLogout} className="nav-link">Cerrar Sesión</button>
                  </nav>
                  <Routes>
                    <Route path="/" element={<Inventory />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/customer-service" element={<CustomerService />} />
                  </Routes>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
