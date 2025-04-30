import { useState, useEffect } from 'react';

function Alerts() {
  interface Product {
    id: number;
    name: string;
    stock: number;
  }

  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const lowStock = data.filter((product: Product) => product.stock < 5); // Cambiar el mínimo a 5
        setLowStockProducts(lowStock);
      });
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1 className="card-header">Alertas de Reposición</h1>
        <div className="card-body">
          {lowStockProducts.length === 0 ? (
            <p className="alert alert-success">Todos los productos tienen suficiente stock.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="low-stock-alert mt-4">
                <p className="font-bold text-red-600">Productos con bajo stock:</p>
                <ul>
                  {lowStockProducts.map((product) => (
                    <li key={product.id} className="text-red-600">
                      {product.name}: {product.stock} unidades
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Alerts;
