import { useState, useEffect } from 'react';

function CustomerService() {
  interface Case {
    id: number;
    customer_id: string;
    issue_description: string;
    resolution_status: string;
  }

  const [cases, setCases] = useState<Case[]>([]);
  const [newCase, setNewCase] = useState({ customer_id: '', issue_description: '' });
  const [editingCase, setEditingCase] = useState<Case | null>(null);

  useEffect(() => {
    fetch('/api/customer-service')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error al obtener casos: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => setCases(data))
      .catch((error) => {
        console.error('Error al cargar casos:', error.message);
        alert('No se pudieron cargar los casos. Revisa la consola para más detalles.');
      });
  }, []);

  const handleAddCase = () => {
    if (!newCase.customer_id || !newCase.issue_description) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    fetch('/api/customer-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCase),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || 'Error al registrar el caso');
          });
        }
        return res.json();
      })
      .then((caseData) => {
        setCases([...cases, caseData]);
        setNewCase({ customer_id: '', issue_description: '' }); // Reiniciar el formulario
        alert('Caso registrado exitosamente.');
      })
      .catch((error) => {
        console.error('Error al registrar caso:', error.message);
        alert(`No se pudo registrar el caso: ${error.message}`);
      });
  };

  const handleEditCase = () => {
    if (!editingCase) return;

    fetch(`/api/customer-service/${editingCase.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCase),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al editar el caso');
        }
        return res.json();
      })
      .then((updatedCase) => {
        setCases(
          cases.map((caseItem) =>
            caseItem.id === updatedCase.id ? updatedCase : caseItem
          )
        );
        setEditingCase(null);
        alert('Caso editado exitosamente.');
      })
      .catch((error) => {
        console.error('Error al editar caso:', error.message);
        alert('No se pudo editar el caso. Revisa la consola para más detalles.');
      });
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="card-header">Atención al Cliente</h1>
        <div className="card-body">
          <h2 className="text-xl font-bold mb-4">
            {editingCase ? 'Editar Caso' : 'Registrar Caso'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">ID del Cliente</label>
              <input
                type="text"
                placeholder="Ingrese el ID del Cliente"
                value={editingCase ? editingCase.customer_id : newCase.customer_id}
                onChange={(e) =>
                  editingCase
                    ? setEditingCase({ ...editingCase, customer_id: e.target.value })
                    : setNewCase({ ...newCase, customer_id: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Descripción del Problema</label>
              <textarea
                placeholder="Describa el problema del cliente"
                value={
                  editingCase
                    ? editingCase.issue_description
                    : newCase.issue_description
                }
                onChange={(e) =>
                  editingCase
                    ? setEditingCase({ ...editingCase, issue_description: e.target.value })
                    : setNewCase({ ...newCase, issue_description: e.target.value })
                }
              />
            </div>
          </div>
          <button
            onClick={editingCase ? handleEditCase : handleAddCase}
            className="mt-4"
          >
            {editingCase ? 'Guardar Cambios' : 'Registrar Caso'}
          </button>
        </div>
      </div>
      <div className="card">
        <h2 className="card-header">Casos Registrados</h2>
        {cases.length === 0 ? (
          <p className="alert alert-info">No hay casos registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>ID Cliente</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>{caseItem.id}</td>
                  <td>{caseItem.customer_id}</td>
                  <td>{caseItem.issue_description}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        caseItem.resolution_status === 'Pendiente'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {caseItem.resolution_status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingCase(caseItem)}
                      className="bg-warning-color text-white p-2 mr-2"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CustomerService;
