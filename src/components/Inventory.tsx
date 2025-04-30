import { useState, useEffect } from 'react';

interface InventoryProps {
  onStockChange: () => void;
}

function Inventory({ onStockChange }: InventoryProps) {
  interface Product {
    id: number;
    name: string;
    stock: number;
    price: number;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', stock: '', price: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.stock || !newProduct.price || +newProduct.stock <= 0 || +newProduct.price <= 0) {
      alert('Por favor, complete todos los campos con valores válidos.');
      return;
    }

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProduct, stock: +newProduct.stock, price: +newProduct.price }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(text || 'Error al agregar el producto');
          });
        }
        return res.json();
      })
      .then((product) => {
        setProducts([...products, product]);
        setNewProduct({ name: '', stock: '', price: '' }); // Reiniciar el formulario
        alert('Producto agregado exitosamente.');
        onStockChange(); // Notificar cambios en el stock
      })
      .catch((error) => {
        console.error('Error:', error.message);
        alert(`Hubo un problema al agregar el producto: ${error.message}`);
      });
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    fetch(`/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editingProduct,
        stock: +editingProduct.stock,
        price: parseFloat(editingProduct.price.toString()),
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al editar el producto');
        }
        return res.json();
      })
      .then((updatedProduct) => {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === updatedProduct.id
              ? { ...product, ...updatedProduct }
              : product
          )
        );
        setEditingProduct(null);
        alert('Producto editado exitosamente.');
        onStockChange(); // Notificar cambios en el stock
      })
      .catch((error) => {
        console.error('Error al editar producto:', error.message);
        alert('No se pudo editar el producto. Revisa la consola para más detalles.');
      });
  };

  const handleDeleteProduct = (id: number) => {
    fetch(`/api/products/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.message || 'Error al eliminar el producto');
          });
        }
        return res.json();
      })
      .then(() => {
        setProducts(products.filter((product) => product.id !== id));
        alert('Producto eliminado exitosamente.');
        onStockChange(); // Notificar cambios en el stock
      })
      .catch((error) => {
        console.error('Error al eliminar producto:', error.message);
        alert(`No se pudo eliminar el producto: ${error.message}`);
      });
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="card-header">Gestión de Inventario</h1>
        <div className="card-body">
          <h2 className="text-xl font-bold mb-4">Agregar Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Nombre del Producto</label>
              <input
                type="text"
                placeholder="Ingrese el nombre del producto"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Cantidad en Stock</label>
              <input
                type="number"
                placeholder="Ingrese la cantidad en stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Precio Unitario (S/.)</label>
              <input
                type="number"
                placeholder="Ingrese el precio unitario"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>
          </div>
          <button onClick={handleAddProduct} className="mt-4">
            Agregar Producto
          </button>
        </div>
      </div>
      <div className="card">
        <h2 className="card-header">Lista de Productos</h2>
        {products.length === 0 ? (
          <p className="alert alert-info">No hay productos disponibles en el inventario.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Precio (S/.)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.stock}</td>
                  <td>
                    {typeof product.price === 'number'
                      ? product.price.toFixed(2)
                      : 'Precio inválido'}
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="bg-warning-color text-white p-2 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-danger-color text-white p-2"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {editingProduct && (
        <div className="card">
          <h2 className="card-header">Editar Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Nombre del Producto</label>
              <input
                type="text"
                placeholder="Ingrese el nombre del producto"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Cantidad en Stock</label>
              <input
                type="number"
                placeholder="Ingrese la cantidad en stock"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, stock: +e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Precio Unitario (S/.)</label>
              <input
                type="number"
                placeholder="Ingrese el precio unitario"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, price: +e.target.value })
                }
              />
            </div>
          </div>
          <button onClick={handleEditProduct} className="mt-4">
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
}

export default Inventory;
