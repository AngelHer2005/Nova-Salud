import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Alerts from './components/Alerts';
import CustomerService from './components/CustomerService';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  const fetchLowStock = () => {
    fetch('/api/low-stock')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al obtener productos con bajo stock');
        }
        return res.json();
      })
      .then((data) => setLowStockCount(data.length))
      .catch((error) => {
        console.error('Error al cargar productos con bajo stock:', error.message);
      });
  };

  useEffect(() => {
    fetchLowStock();
  }, []); // Ejecutar solo una vez al montar el componente

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  useEffect(() => {
    // Sincronizar el estado con localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

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
                    <Link to="/" className="nav-link">Inventario</Link>
                    <Link to="/sales" className="nav-link">Ventas</Link>
                    <Link to="/alerts" className="nav-link relative">
                      Alertas
                      <span
                        className="notification-circle"
                        style={{ display: lowStockCount > 0 ? 'flex' : 'none' }}
                      >
                        {lowStockCount}
                      </span>
                    </Link>
                    <Link to="/customer-service" className="nav-link">Atención al Cliente</Link>
                    <button onClick={handleLogout} className="nav-link">Cerrar Sesión</button>
                  </nav>
                  <Routes>
                    <Route path="/" element={<Inventory onStockChange={fetchLowStock} />} />
                    <Route path="/sales" element={<Sales onStockChange={fetchLowStock} />} />
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
