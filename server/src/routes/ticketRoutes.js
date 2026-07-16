import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createTicket,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  getTickets,
} from '../services/ticketService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Help function to check ticket access permission
function checkTicketAccess(ticket, user) {
  if (user.role === 'manager') {
    return true;
  }
  if (user.role === 'employee') {
    return ticket.created_by === user.id;
  }
  if (user.role === 'support') {
    return ticket.assigned_to === null || ticket.assigned_to === user.id;
  }
  return false;
}

// GET /api/tickets - List tickets based on user's role (with search & filtering)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { search, category, priority, status } = req.query;
    const tickets = await getTickets({
      role: req.user.role,
      userId: req.user.id,
      search,
      category,
      priority,
      status,
    });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
});

// POST /api/tickets - Create a ticket (Employee only)
router.post('/', authenticate, requireRole('employee'), async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    const ticket = await createTicket({
      title,
      description,
      category,
      priority,
      createdByUserId: req.user.id,
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
});

// GET /api/tickets/:id - View a ticket details (All roles with restrictions)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return next(new AppError('Invalid ticket ID', 400));
    }

    const ticket = await getTicketById(ticketId);

    if (!checkTicketAccess(ticket, req.user)) {
      return next(new AppError('You do not have permission to access this resource', 403));
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tickets/:id/assign - Assign ticket (Support only)
router.patch('/:id/assign', authenticate, requireRole('support'), async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return next(new AppError('Invalid ticket ID', 400));
    }

    const { assigned_to } = req.body;
    const assignedToId = parseInt(assigned_to, 10);
    if (isNaN(assignedToId)) {
      return next(new AppError('Invalid assigned_to ID', 400));
    }

    const ticket = await getTicketById(ticketId);

    if (!checkTicketAccess(ticket, req.user)) {
      return next(new AppError('You do not have permission to access this resource', 403));
    }

    const updatedTicket = await assignTicket(ticketId, assignedToId);
    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tickets/:id/status - Update status (Support only)
router.patch('/:id/status', authenticate, requireRole('support'), async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return next(new AppError('Invalid ticket ID', 400));
    }

    const { status } = req.body;
    if (!status) {
      return next(new AppError('Status is required', 400));
    }

    const ticket = await getTicketById(ticketId);

    if (!checkTicketAccess(ticket, req.user)) {
      return next(new AppError('You do not have permission to access this resource', 403));
    }

    const updatedTicket = await updateTicketStatus(ticketId, status, req.user.id);
    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    next(error);
  }
});

export default router;
