const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let body;
  try {
    body = await response.json();
  } catch (err) {
    body = { success: false, message: 'Invalid response format from server' };
  }

  if (!response.ok || body.success === false) {
    throw new Error(body.message || 'Request failed');
  }

  return body.data;
}

export const api = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  getMe: () => request('/auth/me'),
  getTickets: (filters = {}) => {
    const query = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        query.append(key, filters[key]);
      }
    });
    const queryString = query.toString();
    return request(`/tickets${queryString ? `?${queryString}` : ''}`);
  },
  getTicket: (id) => request(`/tickets/${id}`),
  createTicket: (ticket) => request('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticket),
  }),
  assignTicket: (id, assigned_to) => request(`/tickets/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigned_to }),
  }),
  updateTicketStatus: (id, status) => request(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};
