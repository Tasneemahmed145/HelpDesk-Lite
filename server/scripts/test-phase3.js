import app from '../src/app.js';
import { query } from '../src/config/db.js';

const PORT = 5001; // use 5001 for test server to avoid conflicts
let server;

function startServer() {
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      resolve();
    });
  });
}

function stopServer() {
  if (server) {
    server.close();
  }
}

async function request(path, options = {}) {
  const url = `http://localhost:${PORT}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const status = response.status;
  let body = null;
  try {
    body = await response.json();
  } catch (e) {
    // not JSON
  }

  return { status, body };
}

async function runTests() {
  console.log('--- API Verification Tests (Phases 3-4 Revisions) ---');

  // 1. Log in users
  const loginUser = async (email) => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'Password123!' }),
    });
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Failed to login as ${email}: ${JSON.stringify(res.body)}`);
    }
    return { token: res.body.data.token, user: res.body.data.user };
  };

  const alice = await loginUser('alice@company.com'); // Employee
  const bob = await loginUser('bob@company.com');     // Employee
  const carol = await loginUser('carol@company.com'); // Support
  const david = await loginUser('david@company.com'); // Support
  const eve = await loginUser('eve@company.com');     // Manager

  console.log('✔ Logged in users successfully with new format');

  let testTicketId = null;

  // -------------------------------------------------------------
  // Test 1: Ticket Creation
  // -------------------------------------------------------------
  console.log('\nTesting Ticket Creation...');

  // Employee can create ticket
  const createRes1 = await request('/api/tickets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${alice.token}` },
    body: JSON.stringify({
      title: 'Test ticket title',
      description: 'Test ticket description',
      category: 'Technical Issue',
      priority: 'High',
    }),
  });

  if (createRes1.status === 201 && createRes1.body.success && createRes1.body.data.status === 'Open' && createRes1.body.data.created_by === alice.user.id) {
    console.log('  ✔ Employee (Alice) can create tickets successfully (success/data format verified)');
    testTicketId = createRes1.body.data.id;
  } else {
    console.error('  ✘ Employee (Alice) cannot create tickets:', createRes1.status, createRes1.body);
    process.exit(1);
  }

  // Support cannot create ticket
  const createRes2 = await request('/api/tickets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${carol.token}` },
    body: JSON.stringify({
      title: 'Support ticket',
      description: 'Support description',
      category: 'Software Issue',
      priority: 'Low',
    }),
  });
  if (createRes2.status === 403 && createRes2.body.success === false && typeof createRes2.body.message === 'string') {
    console.log('  ✔ Support (Carol) is forbidden from creating tickets (error format verified)');
  } else {
    console.error('  ✘ Support (Carol) creation check failed:', createRes2.status, createRes2.body);
    process.exit(1);
  }

  // Validation check
  const createRes3 = await request('/api/tickets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${alice.token}` },
    body: JSON.stringify({
      title: '',
      description: 'Test description',
      category: 'Invalid Category',
      priority: 'High',
    }),
  });
  if (createRes3.status === 400 && createRes3.body.success === false) {
    console.log('  ✔ Validation rejected empty title and invalid category (error format verified)');
  } else {
    console.error('  ✘ Validation check failed:', createRes3.status, createRes3.body);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 2: Ticket Visibility (GET /api/tickets/:id)
  // -------------------------------------------------------------
  console.log('\nTesting Ticket Visibility...');

  // Employee can view own ticket
  const viewOwn = await request(`/api/tickets/${testTicketId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${alice.token}` },
  });
  if (viewOwn.status === 200 && viewOwn.body.success && viewOwn.body.data.id === testTicketId) {
    console.log('  ✔ Employee (Alice) can view own ticket');
  } else {
    console.error('  ✘ Employee (Alice) view own ticket failed:', viewOwn.status, viewOwn.body);
    process.exit(1);
  }

  // Employee cannot view other employee's ticket
  const viewOtherEmp = await request(`/api/tickets/2`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${alice.token}` },
  });
  if (viewOtherEmp.status === 403 && viewOtherEmp.body.success === false) {
    console.log("  ✔ Employee (Alice) cannot view other employee's (Bob's) ticket");
  } else {
    console.error("  ✘ Employee (Alice) view other's ticket protection failed:", viewOtherEmp.status, viewOtherEmp.body);
    process.exit(1);
  }

  // Support can view unassigned ticket
  const viewUnassigned = await request(`/api/tickets/1`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${carol.token}` },
  });
  if (viewUnassigned.status === 200 && viewUnassigned.body.success) {
    console.log('  ✔ Support (Carol) can view unassigned tickets');
  } else {
    console.error('  ✘ Support (Carol) view unassigned ticket failed:', viewUnassigned.status, viewUnassigned.body);
    process.exit(1);
  }

  // Support can view assigned ticket
  const viewAssignedCarol = await request(`/api/tickets/2`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${carol.token}` },
  });
  if (viewAssignedCarol.status === 200 && viewAssignedCarol.body.success) {
    console.log('  ✔ Support (Carol) can view tickets assigned to them');
  } else {
    console.error('  ✘ Support (Carol) view assigned ticket failed:', viewAssignedCarol.status, viewAssignedCarol.body);
    process.exit(1);
  }

  // Support cannot view tickets assigned to other support staff
  const viewAssignedDavid = await request(`/api/tickets/3`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${carol.token}` },
  });
  if (viewAssignedDavid.status === 403 && viewAssignedDavid.body.success === false) {
    console.log("  ✔ Support (Carol) cannot view tickets assigned to other Support staff (David)");
  } else {
    console.error("  ✘ Support (Carol) protection against other's assigned ticket failed:", viewAssignedDavid.status, viewAssignedDavid.body);
    process.exit(1);
  }

  // Manager can view any ticket
  const viewManager = await request(`/api/tickets/3`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${eve.token}` },
  });
  if (viewManager.status === 200 && viewManager.body.success) {
    console.log('  ✔ Manager (Eve) can view any ticket');
  } else {
    console.error('  ✘ Manager (Eve) view any ticket failed:', viewManager.status, viewManager.body);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 3: List Tickets (GET /api/tickets) with role-based checks, search & filtering
  // -------------------------------------------------------------
  console.log('\nTesting List Tickets (GET /api/tickets)...');

  // Employee (Alice) can see only her own tickets
  const listAlice = await request('/api/tickets', {
    method: 'GET',
    headers: { Authorization: `Bearer ${alice.token}` },
  });
  if (listAlice.status === 200 && listAlice.body.success) {
    const allOwn = listAlice.body.data.every(t => t.created_by === alice.user.id);
    if (allOwn) {
      console.log(`  ✔ Employee (Alice) views only own tickets (count: ${listAlice.body.data.length})`);
    } else {
      console.error('  ✘ Employee (Alice) views non-own tickets:', listAlice.body.data);
      process.exit(1);
    }
  } else {
    console.error('  ✘ Employee (Alice) list failed:', listAlice.status, listAlice.body);
    process.exit(1);
  }

  // Support (Carol) can see only unassigned or tickets assigned to her
  const listCarol = await request('/api/tickets', {
    method: 'GET',
    headers: { Authorization: `Bearer ${carol.token}` },
  });
  if (listCarol.status === 200 && listCarol.body.success) {
    const validCarolTickets = listCarol.body.data.every(
      t => t.assigned_to === null || t.assigned_to === carol.user.id
    );
    if (validCarolTickets) {
      console.log(`  ✔ Support (Carol) views only unassigned or assigned-to-her tickets (count: ${listCarol.body.data.length})`);
    } else {
      console.error('  ✘ Support (Carol) views other support staff tickets:', listCarol.body.data);
      process.exit(1);
    }
  } else {
    console.error('  ✘ Support (Carol) list failed:', listCarol.status, listCarol.body);
    process.exit(1);
  }

  // Manager (Eve) can see all tickets (includes tickets created by Bob and Alice, and assigned to David)
  const listEve = await request('/api/tickets', {
    method: 'GET',
    headers: { Authorization: `Bearer ${eve.token}` },
  });
  if (listEve.status === 200 && listEve.body.success) {
    console.log(`  ✔ Manager (Eve) views all tickets (count: ${listEve.body.data.length})`);
  } else {
    console.error('  ✘ Manager (Eve) list failed:', listEve.status, listEve.body);
    process.exit(1);
  }

  // Test Filtering on List Tickets (Manager)
  const listFiltered = await request('/api/tickets?status=Resolved&category=Software Issue', {
    method: 'GET',
    headers: { Authorization: `Bearer ${eve.token}` },
  });
  if (listFiltered.status === 200 && listFiltered.body.success) {
    const match = listFiltered.body.data.every(
      t => t.status === 'Resolved' && t.category === 'Software Issue'
    );
    if (match) {
      console.log(`  ✔ Filters successfully applied on list (status=Resolved, category=Software Issue)`);
    } else {
      console.error('  ✘ Filter mismatch on list output:', listFiltered.body.data);
      process.exit(1);
    }
  } else {
    console.error('  ✘ Filtered list failed:', listFiltered.status, listFiltered.body);
    process.exit(1);
  }

  // Test Search on List Tickets (Manager)
  const listSearched = await request('/api/tickets?search=laptop', {
    method: 'GET',
    headers: { Authorization: `Bearer ${eve.token}` },
  });
  if (listSearched.status === 200 && listSearched.body.success) {
    const match = listSearched.body.data.every(
      t => t.title.toLowerCase().includes('laptop') || t.description.toLowerCase().includes('laptop')
    );
    if (match && listSearched.body.data.length > 0) {
      console.log(`  ✔ Search filter successfully applied on list for "laptop" (count: ${listSearched.body.data.length})`);
    } else {
      console.error('  ✘ Search filter mismatch or zero results:', listSearched.body.data);
      process.exit(1);
    }
  } else {
    console.error('  ✘ Search list failed:', listSearched.status, listSearched.body);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 4: Ticket Assignment (PATCH /api/tickets/:id/assign)
  // -------------------------------------------------------------
  console.log('\nTesting Ticket Assignment...');

  // Support can assign ticket
  const assignRes1 = await request(`/api/tickets/${testTicketId}/assign`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${carol.token}` },
    body: JSON.stringify({ assigned_to: carol.user.id }),
  });
  if (assignRes1.status === 200 && assignRes1.body.success && assignRes1.body.data.assigned_to === carol.user.id) {
    console.log('  ✔ Support (Carol) can assign unassigned ticket to themselves');
  } else {
    console.error('  ✘ Support (Carol) assignment failed:', assignRes1.status, assignRes1.body);
    process.exit(1);
  }

  // Support cannot assign ticket assigned to other support
  const assignRes2 = await request(`/api/tickets/3/assign`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${carol.token}` },
    body: JSON.stringify({ assigned_to: carol.user.id }),
  });
  if (assignRes2.status === 403 && assignRes2.body.success === false) {
    console.log("  ✔ Support (Carol) cannot assign/view other Support staff's tickets");
  } else {
    console.error('  ✘ Support role separation in assignment failed:', assignRes2.status, assignRes2.body);
    process.exit(1);
  }

  // Support cannot assign to non-Support user (Alice)
  const assignRes3 = await request(`/api/tickets/${testTicketId}/assign`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${carol.token}` },
    body: JSON.stringify({ assigned_to: alice.user.id }),
  });
  if (assignRes3.status === 400 && assignRes3.body.success === false) {
    console.log('  ✔ Reject assigning ticket to user with Employee role');
  } else {
    console.error('  ✘ Employee assignment validation check failed:', assignRes3.status, assignRes3.body);
    process.exit(1);
  }

  // Employee cannot assign ticket
  const assignRes4 = await request(`/api/tickets/${testTicketId}/assign`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${alice.token}` },
    body: JSON.stringify({ assigned_to: david.user.id }),
  });
  if (assignRes4.status === 403 && assignRes4.body.success === false) {
    console.log('  ✔ Employee (Alice) is forbidden from assigning tickets');
  } else {
    console.error('  ✘ Employee assignment protection failed:', assignRes4.status, assignRes4.body);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 5: Ticket Status & Transitions (PATCH /api/tickets/:id/status)
  // -------------------------------------------------------------
  console.log('\nTesting Ticket Status Transitions...');

  // Invalid transition: Open -> Resolved
  const statusRes1 = await request(`/api/tickets/${testTicketId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${carol.token}` },
    body: JSON.stringify({ status: 'Resolved' }),
  });
  if (statusRes1.status === 400 && statusRes1.body.success === false) {
    console.log('  ✔ Reject transition: Open -> Resolved');
  } else {
    console.error('  ✘ Invalid transition Open -> Resolved was not rejected:', statusRes1.status, statusRes1.body);
    process.exit(1);
  }

  // Valid transition: Open -> In Progress
  const statusRes2 = await request(`/api/tickets/${testTicketId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${carol.token}` },
    body: JSON.stringify({ status: 'In Progress' }),
  });
  if (statusRes2.status === 200 && statusRes2.body.success && statusRes2.body.data.status === 'In Progress') {
    console.log('  ✔ Accept transition: Open -> In Progress');
  } else {
    console.error('  ✘ Valid transition Open -> In Progress failed:', statusRes2.status, statusRes2.body);
    process.exit(1);
  }

  // Invalid transition: In Progress -> Closed
  const statusRes3 = await request(`/api/tickets/${testTicketId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${carol.token}` },
    body: JSON.stringify({ status: 'Closed' }),
  });
  if (statusRes3.status === 400 && statusRes3.body.success === false) {
    console.log('  ✔ Reject transition: In Progress -> Closed');
  } else {
    console.error('  ✘ Invalid transition In Progress -> Closed was not rejected:', statusRes3.status, statusRes3.body);
    process.exit(1);
  }

  // Valid transition: In Progress -> Resolved
  const statusRes4 = await request(`/api/tickets/${testTicketId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${carol.token}` },
    body: JSON.stringify({ status: 'Resolved' }),
  });
  if (statusRes4.status === 200 && statusRes4.body.success && statusRes4.body.data.status === 'Resolved') {
    console.log('  ✔ Accept transition: In Progress -> Resolved');
  } else {
    console.error('  ✘ Valid transition In Progress -> Resolved failed:', statusRes4.status, statusRes4.body);
    process.exit(1);
  }

  // Valid transition: Resolved -> Closed
  const statusRes5 = await request(`/api/tickets/${testTicketId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${carol.token}` },
    body: JSON.stringify({ status: 'Closed' }),
  });
  if (statusRes5.status === 200 && statusRes5.body.success && statusRes5.body.data.status === 'Closed' && statusRes5.body.data.closed_at !== null) {
    console.log('  ✔ Accept transition: Resolved -> Closed (and closed_at is set)');
  } else {
    console.error('  ✘ Valid transition Resolved -> Closed failed:', statusRes5.status, statusRes5.body);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 6: Verify Status History Log
  // -------------------------------------------------------------
  console.log('\nTesting Status History Logging...');
  const history = await query(
    'SELECT * FROM status_history WHERE ticket_id = ? ORDER BY id ASC',
    [testTicketId]
  );

  const expectedHistory = [
    { prev: null, new_st: 'Open', changer: alice.user.id },
    { prev: 'Open', new_st: 'In Progress', changer: carol.user.id },
    { prev: 'In Progress', new_st: 'Resolved', changer: carol.user.id },
    { prev: 'Resolved', new_st: 'Closed', changer: carol.user.id },
  ];

  if (history.length === expectedHistory.length) {
    let match = true;
    for (let i = 0; i < history.length; i++) {
      if (
        history[i].previous_status !== expectedHistory[i].prev ||
        history[i].new_status !== expectedHistory[i].new_st ||
        history[i].changed_by !== expectedHistory[i].changer
      ) {
        match = false;
        console.error(`  Mismatch at index ${i}:`, history[i], expectedHistory[i]);
      }
    }
    if (match) {
      console.log('  ✔ All status changes successfully stored in status_history');
    } else {
      process.exit(1);
    }
  } else {
    console.error(`  Status history length mismatch. Expected ${expectedHistory.length}, got ${history.length}`);
    process.exit(1);
  }

  console.log('\n--- All Revisions and Phase 3 Tests Passed! ---');
}

async function start() {
  try {
    await startServer();
    await runTests();
  } catch (error) {
    console.error('Tests failed with error:', error);
    process.exit(1);
  } finally {
    stopServer();
    process.exit(0);
  }
}

start();
