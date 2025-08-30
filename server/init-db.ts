import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./dev.db');

// Crear tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    apellidos TEXT,
    telefono TEXT,
    fecha_nacimiento TEXT,
    pais TEXT,
    direccion TEXT,
    role TEXT NOT NULL DEFAULT 'client',
    sponsor TEXT,
    grade TEXT DEFAULT 'Bronze',
    verification_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS kyc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_number TEXT NOT NULL,
    country TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    documents_urls TEXT,
    rejection_reason TEXT,
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    interest_rate TEXT NOT NULL,
    term_days INTEGER NOT NULL,
    min_amount TEXT NOT NULL,
    max_amount TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    auto_renewal BOOLEAN DEFAULT 0,
    contract_template TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    amount TEXT NOT NULL,
    status TEXT DEFAULT 'ready_to_start',
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    type TEXT NOT NULL,
    message TEXT,
    source TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS calculator_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    amount INTEGER NOT NULL,
    years INTEGER NOT NULL,
    compound_interest BOOLEAN NOT NULL,
    final_amount INTEGER NOT NULL,
    interest_generated INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads (id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    description TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users (id)
  );
`);

// Función para crear usuarios
async function createUser(email: string, password: string, name: string, role: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (email, password, name, role, verification_status, grade)
    VALUES (?, ?, ?, ?, 'verified', 'Gold')
  `);
  
  stmt.run(email, hashedPassword, name, role);
  console.log(`Usuario creado: ${email} con rol ${role}`);
}

// Crear usuarios por defecto
async function createDefaultUsers() {
  try {
    await createUser('clientes@nakama.com', 'demo2025', 'Cliente Demo', 'client');
    await createUser('admin@nakama.com', 'demo2025', 'Administrador', 'admin');
    await createUser('partner@nakama.com', 'demo2025', 'Partner Demo', 'partner');
    
    console.log('✅ Usuarios por defecto creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  }
}

// Crear algunos productos de ejemplo
function createDefaultProducts() {
  const products = [
    {
      name: 'Depósito a 30 días',
      interest_rate: '9.00',
      term_days: 30,
      min_amount: '1000',
      max_amount: '100000',
      status: 'active'
    },
    {
      name: 'Depósito a 90 días',
      interest_rate: '12.00',
      term_days: 90,
      min_amount: '5000',
      max_amount: '500000',
      status: 'active'
    }
  ];

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO products (name, interest_rate, term_days, min_amount, max_amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  products.forEach(product => {
    stmt.run(product.name, product.interest_rate, product.term_days, product.min_amount, product.max_amount, product.status);
  });

  console.log('✅ Productos por defecto creados exitosamente');
}

// Ejecutar inicialización
console.log('🚀 Inicializando base de datos...');
createDefaultUsers().then(() => {
  createDefaultProducts();
  console.log('🎉 Base de datos inicializada completamente');
  db.close();
}).catch(error => {
  console.error('❌ Error durante la inicialización:', error);
  db.close();
});

