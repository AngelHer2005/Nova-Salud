import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al registrar usuario');
        }
        return res.json();
      })
      .then(() => {
        alert('Usuario registrado exitosamente.');
        navigate('/login');
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div className="container flex justify-center items-center min-h-screen">
      <div className="card w-full max-w-md">
        <h1 className="card-header text-center">Registrarse</h1>
        <form onSubmit={handleSubmit} className="card-body">
          <label className="label">Correo Electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <label className="label">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="btn mt-4 w-full">
            Registrarse
          </button>
          <p className="text-center mt-4">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
