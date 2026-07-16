import { query } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

const VALID_CATEGORIES = ['Technical Issue', 'Account Issue', 'Hardware Issue', 'Software Issue', 'Other'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const VALID_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

export async function createTicket({ title, description, category, priority, createdByUserId }) {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new AppError('Title is required and must be a non-empty string', 400);
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    throw new AppError('Description is required and must be a non-empty string', 400);
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw new AppError(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`, 400);
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new AppError(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`, 400);
  }

  // Insert ticket
  const result = await query(
    'INSERT INTO tickets (title, description, category, priority, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [title.trim(), description.trim(), category, priority, 'Open', createdByUserId]
  );
  const ticketId = result.insertId;

  // Insert status history
  await query(
    'INSERT INTO status_history (ticket_id, previous_status, new_status, changed_by) VALUES (?, NULL, ?, ?)',
    [ticketId, 'Open', createdByUserId]
  );

  // Return the created ticket
  const tickets = await query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
  return tickets[0];
}

export async function getTicketById(id) {
  const tickets = await query('SELECT * FROM tickets WHERE id = ?', [id]);
  if (tickets.length === 0) {
    throw new AppError('Ticket not found', 404);
  }
  const ticket = tickets[0];
  const history = await query(
    `SELECT sh.*, u.name as changed_by_name 
     FROM status_history sh 
     LEFT JOIN users u ON sh.changed_by = u.id 
     WHERE sh.ticket_id = ? 
     ORDER BY sh.changed_at ASC`,
    [id]
  );
  
  // Resolve creator and assignee names too for better UI display
  const creator = await query('SELECT name FROM users WHERE id = ?', [ticket.created_by]);
  ticket.created_by_name = creator.length > 0 ? creator[0].name : 'Unknown';
  
  if (ticket.assigned_to) {
    const assignee = await query('SELECT name FROM users WHERE id = ?', [ticket.assigned_to]);
    ticket.assigned_to_name = assignee.length > 0 ? assignee[0].name : 'Unknown';
  } else {
    ticket.assigned_to_name = 'Unassigned';
  }

  ticket.history = history;
  return ticket;
}


export async function assignTicket(ticketId, assignedToId) {
  if (!assignedToId) {
    throw new AppError('assigned_to is required', 400);
  }

  // Validate user has support role
  const users = await query('SELECT role FROM users WHERE id = ?', [assignedToId]);
  if (users.length === 0) {
    throw new AppError('Assigned user not found', 400);
  }
  if (users[0].role !== 'support') {
    throw new AppError('Tickets can only be assigned to support staff', 400);
  }

  // Validate ticket exists
  await getTicketById(ticketId);

  // Update ticket
  await query('UPDATE tickets SET assigned_to = ? WHERE id = ?', [assignedToId, ticketId]);

  // Return updated ticket
  const tickets = await query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
  return tickets[0];
}

export async function updateTicketStatus(ticketId, newStatus, changedByUserId) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const ticket = await getTicketById(ticketId);
  const currentStatus = ticket.status;

  // Validate transition
  let isValid = false;
  if (currentStatus === 'Open' && newStatus === 'In Progress') isValid = true;
  else if (currentStatus === 'In Progress' && newStatus === 'Resolved') isValid = true;
  else if (currentStatus === 'Resolved' && newStatus === 'Closed') isValid = true;

  if (!isValid) {
    throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
  }

  // Perform update
  if (newStatus === 'Closed') {
    await query('UPDATE tickets SET status = ?, closed_at = NOW() WHERE id = ?', [newStatus, ticketId]);
  } else {
    await query('UPDATE tickets SET status = ? WHERE id = ?', [newStatus, ticketId]);
  }

  // Insert status history
  await query(
    'INSERT INTO status_history (ticket_id, previous_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
    [ticketId, currentStatus, newStatus, changedByUserId]
  );

  // Return updated ticket
  const tickets = await query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
  return tickets[0];
}

export async function getTickets({ role, userId, search, category, priority, status }) {
  let sql = 'SELECT * FROM tickets WHERE ';
  const params = [];

  // Enforce role-based restrictions
  if (role === 'employee') {
    sql += 'created_by = ?';
    params.push(userId);
  } else if (role === 'support') {
    sql += '(assigned_to = ? OR assigned_to IS NULL)';
    params.push(userId);
  } else if (role === 'manager') {
    sql += '1 = 1';
  } else {
    throw new AppError('Invalid user role', 403);
  }

  // Search filter (in title or description)
  if (search && typeof search === 'string' && search.trim() !== '') {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    const searchParam = `%${search.trim()}%`;
    params.push(searchParam, searchParam);
  }

  // Category filter
  if (category && typeof category === 'string' && category.trim() !== '') {
    sql += ' AND category = ?';
    params.push(category.trim());
  }

  // Priority filter
  if (priority && typeof priority === 'string' && priority.trim() !== '') {
    sql += ' AND priority = ?';
    params.push(priority.trim());
  }

  // Status filter
  if (status && typeof status === 'string' && status.trim() !== '') {
    sql += ' AND status = ?';
    params.push(status.trim());
  }

  // Sort newest first
  sql += ' ORDER BY created_at DESC';

  return await query(sql, params);
}

