import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'helpdesk_lite';

const SEED_PASSWORD = 'Password123!';

const users = [
  { name: 'Alice Johnson', email: 'alice@company.com', role: 'employee' },
  { name: 'Bob Smith', email: 'bob@company.com', role: 'employee' },
  { name: 'Carol Davis', email: 'carol@company.com', role: 'support' },
  { name: 'David Wilson', email: 'david@company.com', role: 'support' },
  { name: 'Eve Manager', email: 'eve@company.com', role: 'manager' },
];

async function run() {
  console.log('Setting up HelpDesk Lite database...\n');

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await connection.query(schema);
  console.log('Schema created successfully');

  await connection.query('USE helpdesk_lite');

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE status_history');
  await connection.query('TRUNCATE TABLE tickets');
  await connection.query('TRUNCATE TABLE users');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const userIds = {};
  for (const user of users) {
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [user.name, user.email, passwordHash, user.role]
    );
    userIds[user.email] = result.insertId;
    console.log(`  Created user: ${user.name} (${user.role})`);
  }

  const aliceId = userIds['alice@company.com'];
  const bobId = userIds['bob@company.com'];
  const carolId = userIds['carol@company.com'];
  const davidId = userIds['david@company.com'];

  const tickets = [
    {
      title: 'Cannot access email account',
      description: 'I am unable to log into my company email since this morning.',
      category: 'Account Issue',
      priority: 'High',
      status: 'Open',
      created_by: aliceId,
      assigned_to: null,
      daysAgo: 1,
    },
    {
      title: 'Laptop running very slow',
      description: 'My laptop takes over 10 minutes to boot up and applications freeze frequently.',
      category: 'Hardware Issue',
      priority: 'Medium',
      status: 'In Progress',
      created_by: bobId,
      assigned_to: carolId,
      daysAgo: 2,
    },
    {
      title: 'VPN connection drops frequently',
      description: 'VPN disconnects every 15-20 minutes while working remotely.',
      category: 'Technical Issue',
      priority: 'High',
      status: 'In Progress',
      created_by: aliceId,
      assigned_to: davidId,
      daysAgo: 4,
    },
    {
      title: 'Need Microsoft Office installed',
      description: 'Please install Microsoft Office 365 on my workstation.',
      category: 'Software Issue',
      priority: 'Low',
      status: 'Resolved',
      created_by: bobId,
      assigned_to: carolId,
      daysAgo: 5,
    },
    {
      title: 'Printer not working on 3rd floor',
      description: 'The shared printer on the 3rd floor shows offline status.',
      category: 'Hardware Issue',
      priority: 'Medium',
      status: 'Closed',
      created_by: aliceId,
      assigned_to: davidId,
      daysAgo: 7,
    },
    {
      title: 'Password reset request',
      description: 'I forgot my portal password and need it reset.',
      category: 'Account Issue',
      priority: 'Medium',
      status: 'Open',
      created_by: bobId,
      assigned_to: null,
      daysAgo: 4,
    },
    {
      title: 'Software license expired',
      description: 'Adobe Creative Suite shows license expired error.',
      category: 'Software Issue',
      priority: 'High',
      status: 'Resolved',
      created_by: aliceId,
      assigned_to: carolId,
      daysAgo: 3,
    },
    {
      title: 'Wi-Fi connectivity issues',
      description: 'Intermittent Wi-Fi drops in conference room B.',
      category: 'Technical Issue',
      priority: 'Low',
      status: 'Open',
      created_by: bobId,
      assigned_to: null,
      daysAgo: 0,
    },
    {
      title: 'General inquiry about office hours',
      description: 'I would like to know the updated office hours for the support desk.',
      category: 'Other',
      priority: 'Low',
      status: 'Open',
      created_by: aliceId,
      assigned_to: null,
      daysAgo: 1,
    },
  ];

  for (const ticket of tickets) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - ticket.daysAgo);
    const updatedAt = new Date(createdAt);
    updatedAt.setHours(updatedAt.getHours() + 2);

    let closedAt = null;
    if (ticket.status === 'Closed') {
      closedAt = new Date(updatedAt);
      closedAt.setDate(closedAt.getDate() + 1);
    }

    const [result] = await connection.execute(
      `INSERT INTO tickets (title, description, category, priority, status, created_by, assigned_to, created_at, updated_at, closed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket.title,
        ticket.description,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.created_by,
        ticket.assigned_to,
        createdAt,
        updatedAt,
        closedAt,
      ]
    );

    const ticketId = result.insertId;
    const creatorId = ticket.created_by;

    await connection.execute(
      `INSERT INTO status_history (ticket_id, previous_status, new_status, changed_by, changed_at)
       VALUES (?, NULL, 'Open', ?, ?)`,
      [ticketId, creatorId, createdAt]
    );

    if (ticket.status !== 'Open') {
      const statuses = ['In Progress', 'Resolved', 'Closed'];
      let previous = 'Open';
      let changeTime = new Date(createdAt);
      changeTime.setHours(changeTime.getHours() + 1);

      for (const status of statuses) {
        if (status === ticket.status) {
          await connection.execute(
            `INSERT INTO status_history (ticket_id, previous_status, new_status, changed_by, changed_at)
             VALUES (?, ?, ?, ?, ?)`,
            [ticketId, previous, status, ticket.assigned_to || carolId, changeTime]
          );
          break;
        }
        await connection.execute(
          `INSERT INTO status_history (ticket_id, previous_status, new_status, changed_by, changed_at)
           VALUES (?, ?, ?, ?, ?)`,
          [ticketId, previous, status, ticket.assigned_to || carolId, changeTime]
        );
        previous = status;
        changeTime = new Date(changeTime);
        changeTime.setHours(changeTime.getHours() + 1);
      }
    }

    console.log(`  Created ticket: ${ticket.title} (${ticket.status})`);
  }

  await connection.end();

  console.log('\nDatabase setup complete!');
  console.log('\nSeed accounts (password for all: Password123!):');
  console.log('  Employees:  alice@company.com, bob@company.com');
  console.log('  Support:    carol@company.com, david@company.com');
  console.log('  Manager:    eve@company.com');
}

run().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
