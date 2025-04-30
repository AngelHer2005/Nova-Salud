import { useState, useEffect } from 'react';

function Sales() {
  interface Product {
    id: number;
    name: string;
    stock: number;
    price: number;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [sale, setSale] = useState({ product_id: '', quantity: 0 });

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleRegisterSale = () => {
    fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error al registrar venta: ${res.statusText}`);
        }
        return res.json();
      })
      .then(() => {
        setProducts(
          products.map((product) =>
            product.id === +sale.product_id
              ? { ...product, stock: product.stock - sale.quantity }
              : product
          )
        );
        setSale({ product_id: '', quantity: 0 });
        alert('Venta registrada exitosamente.');
      })
      .catch((error) => {
        console.error('Error al registrar venta:', error.message);
        alert('No se pudo registrar la venta. Revisa la consola para más detalles.');
      });
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="card-header">Registrar Venta</h1>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Producto</label>
              <select
                value={sale.product_id}
                onChange={(e) => setSale({ ...sale, product_id: e.target.value })}
              >
                <option value="">Seleccione un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Cantidad</label>
              <input
                type="number"
                placeholder="Ingrese la cantidad"
                value={sale.quantity}
                onChange={(e) => setSale({ ...sale, quantity: +e.target.value })}
              />
            </div>
          </div>
          <button onClick={handleRegisterSale} className="mt-4">
            Registrar Venta
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sales;
