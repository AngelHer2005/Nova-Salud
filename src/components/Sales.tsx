import { useState, useEffect } from 'react';

interface SalesProps {
  onStockChange: () => void;
}

function Sales({ onStockChange }: SalesProps) {
  interface Product {
    id: number;
    name: string;
    stock: number;
    price: number;
  }

  interface Sale {
    id: number;
    product_name: string;
    quantity: number;
    total_price: number | null; // Permitir null para ventas inválidas
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [sale, setSale] = useState({ product_id: '', quantity: '' });

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error al obtener productos: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error('Error al cargar productos:', error.message);
        alert('No se pudieron cargar los productos. Revisa la consola para más detalles.');
      });

    fetch('/api/sales')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error al obtener ventas: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) =>
        setSales(
          data.map((sale: Sale) => ({
            ...sale,
            total_price: sale.total_price !== null ? parseFloat(sale.total_price.toString()) : null,
          }))
        )
      )
      .catch((error) => {
        console.error('Error al cargar ventas:', error.message);
        alert('No se pudieron cargar las ventas. Revisa la consola para más detalles.');
      });
  }, []);

  const handleRegisterSale = () => {
    if (!sale.product_id || !sale.quantity || +sale.quantity <= 0) {
      alert('Por favor, seleccione un producto y una cantidad válida.');
      return;
    }

    const selectedProduct = products.find((product) => product.id === +sale.product_id);

    if (!selectedProduct) {
      alert('Producto no encontrado.');
      return;
    }

    if (+sale.quantity > selectedProduct.stock) {
      alert('La cantidad solicitada excede el stock disponible.');
      return;
    }

    fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: sale.product_id, quantity: +sale.quantity }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || 'Error al registrar la venta');
          });
        }
        return res.json();
      })
      .then((newSale) => {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === +sale.product_id
              ? { ...product, stock: product.stock - +sale.quantity }
              : product
          )
        );
        setSales((prevSales) => [...prevSales, newSale]);
        setSale({ product_id: '', quantity: '' });
        alert('Venta registrada exitosamente.');
        onStockChange(); // Notificar cambios en el stock
      })
      .catch((error) => {
        console.error('Error al registrar venta:', error.message);
        alert(`No se pudo registrar la venta: ${error.message}`);
      });
  };

  const handleDeleteSale = (id: number) => {
    setSales((prevSales) => prevSales.filter((sale) => sale.id !== id));
  };

  const totalQuantity = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
  const totalEarnings = sales.reduce(
    (sum, sale) => sum + (sale.total_price !== null ? sale.total_price : 0),
    0
  );

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
                onChange={(e) => setSale({ ...sale, quantity: e.target.value })}
              />
            </div>
          </div>
          <button onClick={handleRegisterSale} className="mt-4">
            Registrar Venta
          </button>
        </div>
      </div>
      <div className="card">
        <h2 className="card-header">Ventas Registradas</h2>
        {sales.length === 0 ? (
          <p className="alert alert-info">No hay ventas registradas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Total (S/.)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{sale.product_name}</td>
                  <td>{sale.quantity}</td>
                  <td>
                    {sale.total_price !== null
                      ? sale.total_price.toFixed(2)
                      : 'Ganancia inválida'}
                  </td>
                  <td>
                    {sale.total_price === null && (
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="bg-danger-color text-white p-2"
                      >
                        X
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="font-bold">Totales</td>
                <td className="font-bold">{totalQuantity}</td>
                <td className="font-bold">
                  {totalEarnings > 0 ? totalEarnings.toFixed(2) : 'Ganancia inválida'}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

export default Sales;
