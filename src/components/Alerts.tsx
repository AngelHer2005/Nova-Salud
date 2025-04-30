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
        const lowStock = data.filter((product: Product) => product.stock < 10);
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Alerts;
