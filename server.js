import express from 'express';
import mysql from 'mysql2';
import cors from 'cors'; // Importar el paquete CORS
import nodemailer from 'nodemailer';

const app = express();
const port = 3001; // Cambiar a un puerto disponible

// Middleware para manejar CORS
app.use(cors());

// Middleware para manejar JSON
app.use(express.json());

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Reemplaza 'tu_contraseña' con la contraseña correcta
  database: 'nova_salud',
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    process.exit(1); // Finaliza el proceso si no se puede conectar
  }
  console.log('Conexión exitosa a la base de datos');
});

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'angelhernanpatricioarroyo@gmail.com', // Cambia esto si usas otro correo
    pass: 'wrvl fkjs nlou njxb', // Usa una contraseña de aplicación
  },
});

// Rutas de la API
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err.message);
      res.status(500).send('Error al obtener productos');
      return;
    }

    // Asegurarse de que el precio sea un número
    const sanitizedResults = results.map((product) => ({
      ...product,
      price: parseFloat(product.price) || 0, // Convertir a número o usar 0 como valor predeterminado
    }));

    res.json(sanitizedResults);
  });
});

// Endpoint para agregar productos
app.post('/api/products', (req, res) => {
  const { name, stock, price } = req.body;

  // Validar los datos enviados
  if (!name || stock === undefined || price === undefined || stock < 0 || price < 0) {
    res.status(400).json({ message: 'Datos inválidos. Verifique el nombre, stock y precio.' });
    return;
  }

  // Intentar insertar el producto en la base de datos
  db.query(
    'INSERT INTO products (name, stock, price) VALUES (?, ?, ?)',
    [name, stock, price],
    (err, result) => {
      if (err) {
        console.error('Error al agregar producto:', err.message);

        // Devolver un mensaje de error más detallado
        res.status(500).json({
          message: 'Error al agregar producto en la base de datos.',
          error: err.message,
        });
        return;
      }

      // Respuesta exitosa
      res.status(201).json({ id: result.insertId, name, stock, price });
    }
  );
});

// Endpoint para eliminar un producto
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar producto:', err.message);
      res.status(500).json({ message: 'Error al eliminar producto en la base de datos.' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Producto no encontrado.' });
      return;
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente.' });
  });
});

// Endpoint para editar un producto
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, stock, price } = req.body;

  // Validar los datos enviados
  if (!name || stock === undefined || price === undefined || stock < 0 || price < 0) {
    res.status(400).json({ message: 'Datos inválidos. Verifique el nombre, stock y precio.' });
    return;
  }

  // Actualizar el producto en la base de datos
  db.query(
    'UPDATE products SET name = ?, stock = ?, price = ? WHERE id = ?',
    [name, stock, price, id],
    (err, result) => {
      if (err) {
        console.error('Error al editar producto:', err.message);
        res.status(500).json({ message: 'Error al editar producto en la base de datos.' });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Producto no encontrado.' });
        return;
      }

      res.status(200).json({ id, name, stock, price });
    }
  );
});

// Endpoints para clientes
app.get('/api/customers', (req, res) => {
  db.query('SELECT * FROM customers', (err, results) => {
    if (err) {
      console.error('Error al obtener clientes:', err.message);
      res.status(500).send('Error al obtener clientes');
      return;
    }
    res.json(results);
  });
});

app.post('/api/customers', (req, res) => {
  const { name, email, phone } = req.body;
  db.query('INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], (err, result) => {
    if (err) {
      console.error('Error al agregar cliente:', err.message);
      res.status(500).send('Error al agregar cliente');
      return;
    }
    res.json({ id: result.insertId, name, email, phone });
  });
});

// Endpoints para atención al cliente
app.get('/api/customer-service', (req, res) => {
  db.query('SELECT * FROM customer_service', (err, results) => {
    if (err) {
      console.error('Error al obtener casos de atención al cliente:', err.message);
      res.status(500).send('Error al obtener casos');
      return;
    }
    res.json(results);
  });
});

// Endpoint para registrar un caso de atención al cliente
app.post('/api/customer-service', (req, res) => {
  const { customer_id, issue_description } = req.body;

  // Validar los datos enviados
  if (!customer_id || !issue_description) {
    res.status(400).json({ message: 'Datos inválidos. Verifique el ID del cliente y la descripción del problema.' });
    return;
  }

  db.query(
    'INSERT INTO customer_service (customer_id, issue_description) VALUES (?, ?)',
    [customer_id, issue_description],
    (err, result) => {
      if (err) {
        console.error('Error al registrar caso de atención al cliente:', err.message);

        // Manejar errores específicos de la base de datos
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          res.status(400).json({ message: 'El ID del cliente no existe en la base de datos.' });
        } else {
          res.status(500).json({ message: 'Error al registrar caso en la base de datos.' });
        }
        return;
      }

      res.status(201).json({
        id: result.insertId,
        customer_id,
        issue_description,
        resolution_status: 'Pendiente',
      });
    }
  );
});

// Endpoint para enviar un caso por correo
app.post('/api/customer-service/email', (req, res) => {
  const { email, issue_description } = req.body;

  // Validar los datos enviados
  if (!email || !issue_description) {
    res.status(400).json({ message: 'Correo electrónico y descripción son requeridos.' });
    return;
  }

  const mailOptions = {
    from: email,
    to: 'angelhernanpatricioarroyo@gmail.com',
    subject: 'Nuevo Caso de Atención al Cliente',
    text: `Correo del cliente: ${email}\n\nDescripción del problema:\n${issue_description}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error al enviar correo:', err.message);
      res.status(500).json({ message: 'Error al enviar el correo.' });
      return;
    }
    res.status(200).json({ message: 'Correo enviado exitosamente.' });
  });
});

// Endpoint para registrar ventas
app.post('/api/sales', (req, res) => {
  const { product_id, quantity } = req.body;

  db.query(
    'SELECT * FROM products WHERE id = ?',
    [product_id],
    (err, results) => {
      if (err || results.length === 0) {
        console.error('Error al verificar stock:', err?.message || 'Producto no encontrado');
        res.status(500).json({ message: 'Error al registrar venta' });
        return;
      }

      const product = results[0];
      if (product.stock < quantity) {
        res.status(400).json({ message: 'Stock insuficiente' });
        return;
      }

      const total_price = product.price * quantity;

      db.query(
        'INSERT INTO sales (product_id, quantity) VALUES (?, ?)',
        [product_id, quantity],
        (err, result) => {
          if (err) {
            console.error('Error al registrar venta:', err.message);
            res.status(500).json({ message: 'Error al registrar venta' });
            return;
          }

          db.query(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [quantity, product_id],
            (err) => {
              if (err) {
                console.error('Error al actualizar stock:', err.message);
                res.status(500).json({ message: 'Error al actualizar stock' });
                return;
              }

              res.status(201).json({
                id: result.insertId,
                product_name: product.name,
                quantity,
                total_price,
              });
            }
          );
        }
      );
    }
  );
});

// Endpoint para obtener todas las ventas
app.get('/api/sales', (req, res) => {
  db.query(
    'SELECT sales.id, products.name AS product_name, sales.quantity, (sales.quantity * products.price) AS total_price FROM sales JOIN products ON sales.product_id = products.id',
    (err, results) => {
      if (err) {
        console.error('Error al obtener ventas:', err.message);
        res.status(500).send('Error al obtener ventas');
        return;
      }

      // Asegurarse de que total_price sea un número
      const sanitizedResults = results.map((sale) => ({
        ...sale,
        total_price: parseFloat(sale.total_price),
      }));

      res.json(sanitizedResults);
    }
  );
});

// Endpoint para obtener productos con bajo stock
app.get('/api/low-stock', (req, res) => {
  db.query('SELECT * FROM products WHERE stock < 10', (err, results) => {
    if (err) {
      console.error('Error al obtener productos con bajo stock:', err.message);
      res.status(500).send('Error al obtener productos con bajo stock');
      return;
    }
    res.json(results);
  });
});

// Endpoint para registrar un usuario
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;

  // Validar los datos enviados
  if (!email || !password) {
    res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos.' });
    return;
  }

  // Insertar el usuario en la base de datos
  db.query(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, password],
    (err, result) => {
      if (err) {
        console.error('Error al registrar usuario:', err.message);

        // Manejar errores específicos de la base de datos
        if (err.code === 'ER_DUP_ENTRY') {
          res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        } else {
          res.status(500).json({ message: 'Error al registrar usuario en la base de datos.' });
        }
        return;
      }

      res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    }
  );
});

// Endpoint para iniciar sesión
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Validar los datos enviados
  if (!email || !password) {
    res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos.' });
    return;
  }

  // Verificar si el usuario existe en la base de datos
  db.query(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) {
        console.error('Error al verificar usuario:', err.message);
        res.status(500).json({ message: 'Error al verificar usuario en la base de datos.' });
        return;
      }

      if (results.length === 0) {
        res.status(401).json({ message: 'Credenciales inválidas.' });
        return;
      }

      res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    }
  );
});

// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({ message: 'Ocurrió un error inesperado en el servidor.' });
});

// Asegurarse de que el servidor no se detenga
process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa no manejada:', promise, 'Razón:', reason);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
