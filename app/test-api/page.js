'use client';

import {useState} from 'react';
import Header from '../components/Header';

export default function TestApiPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    mensaje: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/regreso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError('Error al enviar los datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <Header />
      <div>
        <h1>Test API Page</h1>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label>
            <input 
              type="text" 
              name="nombre" 
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Mensaje:</label>
            <textarea 
              name="mensaje" 
              value={formData.mensaje}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Datos'}
          </button>
        </form>
        
        {error && <p>{error}</p>}

        {data && (
          <div>
            <h2>Respuesta del servidor:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 