CREATE DATABASE IF NOT EXISTS nova_salud;
USE nova_salud;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stock INT NOT NULL CHECK (stock >= 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0)
) ENGINE=InnoDB;

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20)
) ENGINE=InnoDB;

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  customer_id INT DEFAULT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla de atención al cliente
CREATE TABLE IF NOT EXISTS customer_service (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  issue_description TEXT NOT NULL,
  resolution_status VARCHAR(50) DEFAULT 'Pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Trigger para alertas automáticas de bajo stock
DELIMITER $$
CREATE TRIGGER after_sale_update_stock
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;

  -- Validar si el stock es menor a 10 y enviar alerta (simulado con log)
  IF (SELECT stock FROM products WHERE id = NEW.product_id) < 10 THEN
    INSERT INTO alerts (product_id, alert_message, created_at)
    VALUES (NEW.product_id, CONCAT('El producto con ID ', NEW.product_id, ' tiene bajo stock.'), NOW());
  END IF;
END$$
DELIMITER ;

-- Tabla de alertas
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  alert_message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB;