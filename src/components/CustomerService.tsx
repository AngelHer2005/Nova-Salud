import { useState, useEffect } from 'react';

function CustomerService() {
  interface Case {
    id: number;
    email: string;
    issue_description: string;
    resolution_status: string;
  }

  const [cases, setCases] = useState<Case[]>([]);
  const [newCase, setNewCase] = useState({ email: '', issue_description: '' });
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
    if (!newCase.email || !newCase.issue_description) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    fetch('/api/customer-service/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCase),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || 'Error al enviar el caso');
          });
        }
        return res.json();
      })
      .then((createdCase) => {
        setCases((prevCases) => [
          ...prevCases,
          {
            id: createdCase.id,
            email: newCase.email,
            issue_description: newCase.issue_description,
            resolution_status: 'Pendiente',
          },
        ]);
        setNewCase({ email: '', issue_description: '' }); // Reiniciar el formulario
        alert('Mensaje enviado exitosamente. Espere la respuesta del equipo.');
      })
      .catch((error) => {
        console.error('Error al enviar el caso:', error.message);
        alert(`No se pudo enviar el caso: ${error.message}`);
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
          return res.json().then((error) => {
            throw new Error(error.message || 'Error al editar el caso');
          });
        }
        return res.json();
      })
      .then((updatedCase) => {
        setCases((prevCases) =>
          prevCases.map((caseItem) =>
            caseItem.id === updatedCase.id
              ? { ...caseItem, ...updatedCase }
              : caseItem
          )
        );
        setEditingCase(null);
        alert('Caso editado exitosamente.');
      })
      .catch((error) => {
        console.error('Error al editar caso:', error.message);
        alert(`No se pudo editar el caso: ${error.message}`);
      });
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="card-header">Atención al Cliente</h1>
        <div className="card-body">
          <h2 className="text-xl font-bold mb-4">
            {editingCase ? 'Editar Caso' : 'Enviar Caso'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Correo Electrónico</label>
              <input
                type="email"
                placeholder="Ingrese su correo electrónico"
                value={editingCase ? editingCase.email : newCase.email}
                onChange={(e) =>
                  editingCase
                    ? setEditingCase({ ...editingCase, email: e.target.value })
                    : setNewCase({ ...newCase, email: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Descripción del Problema</label>
              <textarea
                placeholder="Describa el problema"
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
            {editingCase ? 'Guardar Cambios' : 'Enviar Caso'}
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
                <th>Correo Electrónico</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>{caseItem.id}</td>
                  <td>{caseItem.email}</td>
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
