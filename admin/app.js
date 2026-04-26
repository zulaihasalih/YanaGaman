/**
 * ══════════════════════════════════════════════════════════════
 *  YANAGAMAN ADMIN — app.js
 *  Frontend Application Logic
 *  Connects UI ↔ API layer, manages state & routing
 * ══════════════════════════════════════════════════════════════
 */

/* ─────────────────────────────────────────────
   APPLICATION STATE
───────────────────────────────────────────── */
const State = {
  currentPage:     'dashboard',
  sidebarCollapsed: false,
  charts:          {},            // Chart.js instances keyed by id
  currentChartType:'revenue',     // 'revenue' | 'rides'
  tables: {
    rides:    { page: 1, sort: 'id', dir: 'desc', filter: '', status: '' },
    users:    { page: 1, filter: '', status: '' },
    drivers:  { page: 1, filter: '', status: '' },
    payments: { page: 1, filter: '', type: '' },
  },
  dashboardPeriod: 'month',
  reportChart:     null,
};

/* ─────────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  populateNotifications();

  // If already authenticated (e.g. page refresh in session)
  if (Auth.isAuthenticated()) {
    showApp();
  }
});

/* ─────────────────────────────────────────────
   CLOCK
───────────────────────────────────────────── */
function startClock() {
  const el = document.getElementById('topbar-time');
  const tick = () => {
    if (el) el.textContent = new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  tick();
  setInterval(tick, 1000);
}

/* ─────────────────────────────────────────────
   AUTH FLOW
───────────────────────────────────────────── */
async function doLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const role     = document.getElementById('login-role').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.querySelector('.btn-login');

  errEl.classList.add('hidden');
  btn.textContent = 'Signing in…';
  btn.disabled = true;

  try {
    const { token, user } = await AuthAPI.login(email, password, role);
    Auth.setSession(token, user, role);
    showApp();
  } catch (err) {
    errEl.textContent = 'Invalid credentials. Please try again.';
    errEl.classList.remove('hidden');
  } finally {
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Populate sidebar user info
  const user = Auth.getUser();
  const role = Auth.getRole();
  if (user) {
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    document.getElementById('sidebar-avatar').textContent = initials;
    document.getElementById('sidebar-name').textContent = user.name.split(' ').map(cap).join(' ');
    document.getElementById('sidebar-role').textContent = role.replace('_',' ');
  }

  // Apply role-based nav restrictions
  RBACModule.applyNavRestrictions();

  // Load dashboard
  navigate('dashboard');
}

async function doLogout() {
  await AuthAPI.logout();
  Auth.clear();
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  showToast('Signed out successfully', 'info');
}

/* ─────────────────────────────────────────────
   NAVIGATION / ROUTING
───────────────────────────────────────────── */
function navigate(page) {
  // Permissions guard
  const restrictedPages = { roles: 'manage_roles', payments: 'view_payments' };
  if (restrictedPages[page] && !RBACModule.can(restrictedPages[page])) {
    showToast('Access denied: insufficient permissions', 'error');
    return;
  }

  // Hide all pages, show target
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  // Update breadcrumb
  const labels = { dashboard:'Dashboard', rides:'Ride Management', users:'User Management', drivers:'Driver Management', payments:'Payments', reports:'Reports', roles:'Roles & Access', settings:'Settings' };
  document.getElementById('breadcrumb').textContent = labels[page] || cap(page);

  State.currentPage = page;

  // Load page data
  loadPage(page);

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('mobile-open');
}

async function loadPage(page) {
  switch(page) {
    case 'dashboard': await loadDashboard();  break;
    case 'rides':     await loadRides();      break;
    case 'users':     await loadUsers();      break;
    case 'drivers':   await loadDrivers();    break;
    case 'payments':  await loadPayments();   break;
    case 'reports':   loadReportsPage();      break;
    case 'roles':     await loadRoles();      break;
    case 'settings':  /* static */            break;
  }
}

/* ─────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────── */
async function loadDashboard() {
  const period = document.getElementById('period-select').value;
  State.dashboardPeriod = period;

  // Set date subtitle
  const now = new Date();
  document.getElementById('dash-date').textContent =
    now.toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const [paySum, rideStats, driverStats, vehicleMix, revTrend] = await Promise.all([
    PaymentsAPI.getSummary(period),
    RidesAPI.getStats(period),
    DriversAPI.getStats(),
    ReportsAPI.getVehicleMix(),
    ReportsAPI.getRevenueTrend(period),
  ]);

  renderKPIs(paySum, rideStats, driverStats);
  renderMainChart(revTrend);
  renderDonut(vehicleMix);
  renderActivity();
  renderLiveStats(rideStats, driverStats);
}

function refreshDashboard() { loadDashboard(); }

function renderKPIs(paySum, rideStats, driverStats) {
  const grid = document.getElementById('kpi-grid');
  const kpis = [
    { label:'Total Revenue',   value: fmtLKR(paySum.totalRevenue), trend:'+12.4%', up:true,  icon:'💰', color:'c-gold',  icolor:'gold' },
    { label:'Total Rides',     value: fmtNum(Math.round(rideStats.total)), trend:'+8.1%', up:true, icon:'🚗', color:'c-blue', icolor:'blue' },
    { label:'Active Drivers',  value: driverStats.online + driverStats.on_trip, trend:'+3', up:true, icon:'🪪', color:'c-green', icolor:'green' },
    { label:'Cancellation Rate',value:'6.0%', trend:'-1.2%', up:false, icon:'❌', color:'c-red', icolor:'red' },
  ];

  grid.innerHTML = kpis.map(k => `
    <div class="kpi-card ${k.color}">
      <div class="kpi-header">
        <div class="kpi-icon ${k.icolor}">${k.icon}</div>
        <span class="kpi-trend ${k.up ? 'up' : 'down'}">${k.up ? '▲' : '▼'} ${k.trend}</span>
      </div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`).join('');
}

let mainChartInst = null;
function renderMainChart(data) {
  const canvas = document.getElementById('main-chart');
  if (mainChartInst) mainChartInst.destroy();
  mainChartInst = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        borderColor: '#F5A623',
        backgroundColor: 'rgba(245,166,35,.08)',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#F5A623',
        pointRadius: 3,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#E2E6F0' }, ticks: { color: '#6B7A99', font: { family: 'DM Sans', size: 11 } } },
        x: { grid: { display: false }, ticks: { color: '#6B7A99', font: { family: 'DM Sans', size: 11 }, maxTicksLimit: 10 } },
      },
    }
  });
  State.charts['main'] = mainChartInst;
}

async function switchChart(type, btn) {
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  State.currentChartType = type;
  const data = type === 'revenue'
    ? await ReportsAPI.getRevenueTrend(State.dashboardPeriod)
    : await ReportsAPI.getRideTrend(State.dashboardPeriod);
  renderMainChart(data);
}

let donutChartInst = null;
function renderDonut(vehicleMix) {
  const canvas = document.getElementById('donut-chart');
  if (donutChartInst) donutChartInst.destroy();
  donutChartInst = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: vehicleMix.map(v => v.label),
      datasets: [{ data: vehicleMix.map(v => v.value), backgroundColor: vehicleMix.map(v => v.color), borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      cutout: '68%',
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } } },
    }
  });

  const legend = document.getElementById('donut-legend');
  legend.innerHTML = vehicleMix.map(v => `
    <div class="donut-legend-item">
      <div class="donut-legend-dot" style="background:${v.color}"></div>
      ${v.label}
      <span>${v.value}%</span>
    </div>`).join('');
}

function renderActivity() {
  const list = document.getElementById('activity-list');
  const recentRides = MockDB.rides.slice(0, 5);
  list.innerHTML = recentRides.map(r => {
    const dotClass = r.status === 'completed' ? 'green' : r.status === 'cancelled' ? 'red' : r.status === 'active' ? 'blue' : 'gold';
    const icon = r.status === 'completed' ? '✓' : r.status === 'cancelled' ? '✗' : r.status === 'active' ? '→' : '⏳';
    return `<div class="activity-item">
      <div class="activity-dot ${dotClass}">${icon}</div>
      <div class="activity-text">
        <strong>${r.id} — ${r.passenger}</strong>
        <span>${r.from} → ${r.to} &nbsp;•&nbsp; ${r.time}</span>
      </div>
      <div class="activity-amount">LKR ${r.fare.toLocaleString()}</div>
    </div>`;
  }).join('');
}

function renderLiveStats(rideStats, driverStats) {
  const el = document.getElementById('live-stats');
  el.innerHTML = `
    <div class="live-stat"><strong>${rideStats.active}</strong><span>Active Rides</span></div>
    <div class="live-stat"><strong>${driverStats.online}</strong><span>Online Drivers</span></div>
    <div class="live-stat"><strong>${driverStats.on_trip}</strong><span>On Trip</span></div>`;
}

/* ─────────────────────────────────────────────
   RIDES PAGE
───────────────────────────────────────────── */
async function loadRides() {
  const t = State.tables.rides;
  const res = await RidesAPI.getAll({ status: t.status, search: t.filter, page: t.page });
  renderRidesTable(res);
}

function renderRidesTable({ data, total, page, pages }) {
  document.getElementById('rides-count').textContent = `${total} rides`;
  const tbody = document.getElementById('rides-body');
  tbody.innerHTML = data.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td>${r.passenger}</td>
      <td>${r.driver}</td>
      <td>${r.vehicle}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.from} → ${r.to}">${r.from} → ${r.to}</td>
      <td><strong>${r.fare.toLocaleString()}</strong></td>
      <td>${badge(r.status)}</td>
      <td style="font-size:.78rem;color:#6B7A99;">${r.time}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="viewRide('${r.id}')" title="View">👁</button>
          ${r.status === 'active' || r.status === 'pending' ? `<button class="btn-icon danger" onclick="cancelRide('${r.id}')" title="Cancel">✕</button>` : ''}
        </div>
      </td>
    </tr>`).join('');
  renderPagination('rides', page, pages);
}

function filterRides() {
  State.tables.rides.filter = document.getElementById('ride-search').value;
  State.tables.rides.status = document.getElementById('ride-status-filter').value;
  State.tables.rides.page = 1;
  loadRides();
}

async function viewRide(id) {
  const ride = await RidesAPI.getById(id);
  document.getElementById('modal-ride-title').textContent = `Ride ${ride.id}`;
  document.getElementById('modal-ride-body').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><label>Status</label><strong>${badge(ride.status)}</strong></div>
      <div class="detail-item"><label>Vehicle Type</label><strong>${ride.vehicle}</strong></div>
      <div class="detail-item"><label>Passenger</label><strong>${ride.passenger}</strong></div>
      <div class="detail-item"><label>Driver</label><strong>${ride.driver}</strong></div>
      <div class="detail-item"><label>Pickup</label><strong>${ride.from}</strong></div>
      <div class="detail-item"><label>Destination</label><strong>${ride.to}</strong></div>
      <div class="detail-item"><label>Fare</label><strong>LKR ${ride.fare.toLocaleString()}</strong></div>
      <div class="detail-item"><label>Distance</label><strong>${ride.distance}</strong></div>
      <div class="detail-item"><label>Duration</label><strong>${ride.duration}</strong></div>
      <div class="detail-item"><label>Date & Time</label><strong>${ride.time}</strong></div>
    </div>`;

  const cancelBtn = document.getElementById('modal-ride-cancel-btn');
  cancelBtn.style.display = (ride.status === 'active' || ride.status === 'pending') ? 'inline-flex' : 'none';
  cancelBtn.onclick = () => cancelRide(id);

  openModal('ride-detail');
}

async function cancelRide(id) {
  if (!confirm('Cancel this ride? This action cannot be undone.')) return;
  await RidesAPI.cancel(id, 'Admin cancellation');
  closeModal();
  showToast('Ride cancelled successfully', 'success');
  loadRides();
  document.getElementById('badge-rides').textContent = Math.max(0, parseInt(document.getElementById('badge-rides').textContent) - 1);
}

function exportRides() { showToast('Exporting rides as CSV…', 'info'); }

/* ─────────────────────────────────────────────
   USERS PAGE
───────────────────────────────────────────── */
async function loadUsers() {
  const t = State.tables.users;
  const res = await UsersAPI.getAll({ status: t.status, search: t.filter, page: t.page });
  renderUsersTable(res);
}

function renderUsersTable({ data, total, page, pages }) {
  document.getElementById('users-count').textContent = `${total} users`;
  const tbody = document.getElementById('users-body');
  tbody.innerHTML = data.map(u => `
    <tr>
      <td><strong>${u.id}</strong></td>
      <td>${u.name}</td>
      <td>${u.phone}</td>
      <td style="color:#6B7A99">${u.email}</td>
      <td>${u.rides}</td>
      <td>LKR ${u.spent.toLocaleString()}</td>
      <td style="font-size:.78rem;color:#6B7A99">${u.joined}</td>
      <td>${badge(u.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="viewUser('${u.id}')" title="View">👁</button>
          <button class="btn-icon ${u.status === 'active' ? 'danger' : ''}" onclick="toggleUser('${u.id}','${u.status}')" title="${u.status === 'suspended' ? 'Activate' : 'Suspend'}">${u.status === 'suspended' ? '✓' : '⊘'}</button>
        </div>
      </td>
    </tr>`).join('');
  renderPagination('users', page, pages);
}

function filterUsers() {
  State.tables.users.filter = document.getElementById('user-search').value;
  State.tables.users.status = document.getElementById('user-status-filter').value;
  State.tables.users.page = 1;
  loadUsers();
}

async function viewUser(id) {
  const u = await UsersAPI.getById(id);
  document.getElementById('modal-user-body').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><label>User ID</label><strong>${u.id}</strong></div>
      <div class="detail-item"><label>Status</label><strong>${badge(u.status)}</strong></div>
      <div class="detail-item"><label>Full Name</label><strong>${u.name}</strong></div>
      <div class="detail-item"><label>Phone</label><strong>${u.phone}</strong></div>
      <div class="detail-item"><label>Email</label><strong>${u.email}</strong></div>
      <div class="detail-item"><label>Joined</label><strong>${u.joined}</strong></div>
      <div class="detail-item"><label>Total Rides</label><strong>${u.rides}</strong></div>
      <div class="detail-item"><label>Total Spent</label><strong>LKR ${u.spent.toLocaleString()}</strong></div>
    </div>`;
  const suspendBtn = document.getElementById('modal-user-suspend-btn');
  suspendBtn.textContent = u.status === 'suspended' ? 'Activate User' : 'Suspend User';
  suspendBtn.onclick = () => toggleUser(id, u.status);
  openModal('user-detail');
}

async function toggleUser(id, currentStatus) {
  const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
  await UsersAPI.updateStatus(id, newStatus);
  closeModal();
  showToast(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`, 'success');
  loadUsers();
}

async function addUser() {
  const name  = document.getElementById('nu-name').value.trim();
  const phone = document.getElementById('nu-phone').value.trim();
  const email = document.getElementById('nu-email').value.trim();
  if (!name || !phone) { showToast('Name and phone are required', 'error'); return; }
  await UsersAPI.create({ name, phone, email });
  closeModal();
  showToast('User created successfully', 'success');
  loadUsers();
}

/* ─────────────────────────────────────────────
   DRIVERS PAGE
───────────────────────────────────────────── */
async function loadDrivers() {
  const t = State.tables.drivers;
  const res = await DriversAPI.getAll({ status: t.status, search: t.filter, page: t.page });
  renderDriversTable(res);
}

function renderDriversTable({ data, total, page, pages }) {
  document.getElementById('drivers-count').textContent = `${total} drivers`;
  const tbody = document.getElementById('drivers-body');
  tbody.innerHTML = data.map(d => `
    <tr>
      <td><strong>${d.id}</strong></td>
      <td>${d.name}</td>
      <td>${d.phone}</td>
      <td style="font-size:.8rem;color:#6B7A99">${d.vehicle}</td>
      <td><span class="stars">${renderStars(d.rating)}</span> ${d.rating}</td>
      <td>${d.rides.toLocaleString()}</td>
      <td>LKR ${d.earned.toLocaleString()}</td>
      <td>${badge(d.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="viewDriver('${d.id}')" title="View">👁</button>
          ${d.status === 'pending' ? `<button class="btn-icon" onclick="approveDriver('${d.id}')" title="Approve" style="color:var(--success)">✓</button>` : ''}
          ${d.status !== 'suspended' && d.status !== 'pending' ? `<button class="btn-icon danger" onclick="suspendDriver('${d.id}')" title="Suspend">⊘</button>` : ''}
        </div>
      </td>
    </tr>`).join('');
  renderPagination('drivers', page, pages);
}

function filterDrivers() {
  State.tables.drivers.filter = document.getElementById('driver-search').value;
  State.tables.drivers.status = document.getElementById('driver-status-filter').value;
  State.tables.drivers.page = 1;
  loadDrivers();
}

async function viewDriver(id) {
  const d = await DriversAPI.getById(id);
  document.getElementById('modal-driver-body').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><label>Driver ID</label><strong>${d.id}</strong></div>
      <div class="detail-item"><label>Status</label><strong>${badge(d.status)}</strong></div>
      <div class="detail-item"><label>Full Name</label><strong>${d.name}</strong></div>
      <div class="detail-item"><label>Phone</label><strong>${d.phone}</strong></div>
      <div class="detail-item"><label>Vehicle</label><strong>${d.vehicle}</strong></div>
      <div class="detail-item"><label>Type</label><strong>${cap(d.type)}</strong></div>
      <div class="detail-item"><label>Rating</label><strong><span class="stars">${renderStars(d.rating)}</span> ${d.rating}/5.0</strong></div>
      <div class="detail-item"><label>Total Rides</label><strong>${d.rides.toLocaleString()}</strong></div>
      <div class="detail-item"><label>Total Earned</label><strong>LKR ${d.earned.toLocaleString()}</strong></div>
      <div class="detail-item"><label>Joined</label><strong>${d.joined}</strong></div>
    </div>`;

  const approveBtn = document.getElementById('modal-driver-approve-btn');
  const suspendBtn = document.getElementById('modal-driver-suspend-btn');
  approveBtn.style.display = d.status === 'pending' ? 'inline-flex' : 'none';
  approveBtn.onclick = () => approveDriver(id);
  suspendBtn.textContent = d.status === 'suspended' ? 'Reinstate' : 'Suspend';
  suspendBtn.onclick = () => suspendDriver(id, d.status);

  openModal('driver-detail');
}

async function approveDriver(id) {
  await DriversAPI.approve(id);
  closeModal();
  showToast('Driver approved successfully', 'success');
  loadDrivers();
}

async function suspendDriver(id, currentStatus) {
  const newStatus = currentStatus === 'suspended' ? 'offline' : 'suspended';
  await DriversAPI.updateStatus(id, newStatus);
  closeModal();
  showToast(`Driver ${newStatus === 'suspended' ? 'suspended' : 'reinstated'}`, 'success');
  loadDrivers();
}

/* ─────────────────────────────────────────────
   PAYMENTS PAGE
───────────────────────────────────────────── */
async function loadPayments() {
  const t = State.tables.payments;
  const [res, summary] = await Promise.all([
    PaymentsAPI.getAll({ type: t.type, search: t.filter, page: t.page }),
    PaymentsAPI.getSummary('month'),
  ]);
  renderPaymentKPIs(summary);
  renderPaymentsTable(res);
}

function renderPaymentKPIs(s) {
  document.getElementById('payment-kpi').innerHTML = [
    { label:'Gross Revenue',    value: fmtLKR(s.totalRevenue), icon:'💰', color:'c-gold',  icolor:'gold'  },
    { label:'Platform Earnings',value: fmtLKR(s.platformCut),  icon:'🏦', color:'c-blue',  icolor:'blue'  },
    { label:'Driver Payouts',   value: fmtLKR(s.driverPayouts),icon:'🪙', color:'c-green', icolor:'green' },
    { label:'Total Refunds',    value: fmtLKR(s.totalRefunds), icon:'↩', color:'c-red',   icolor:'red'   },
  ].map(k => `
    <div class="kpi-card ${k.color}">
      <div class="kpi-header"><div class="kpi-icon ${k.icolor}">${k.icon}</div></div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`).join('');
}

function renderPaymentsTable({ data, total, page, pages }) {
  document.getElementById('payments-count').textContent = `${total} transactions`;
  const typeColors = { ride:'badge-completed', refund:'badge-cancelled', payout:'badge-active', promo:'badge-pending' };
  document.getElementById('payments-body').innerHTML = data.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.user}</td>
      <td><span class="badge ${typeColors[p.type] || ''}">${p.type}</span></td>
      <td><strong>${p.amount.toLocaleString()}</strong></td>
      <td>${p.method}</td>
      <td>${badge(p.status)}</td>
      <td style="font-size:.78rem;color:#6B7A99">${p.rideId}</td>
      <td style="font-size:.78rem;color:#6B7A99">${p.date}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="View Receipt">🧾</button>
          ${p.type === 'ride' && p.status === 'completed' ? `<button class="btn-icon danger" title="Refund" onclick="showToast('Refund initiated for ${p.id}','info')">↩</button>` : ''}
        </div>
      </td>
    </tr>`).join('');
  renderPagination('payments', page, pages);
}

function filterPayments() {
  State.tables.payments.filter = document.getElementById('payment-search').value;
  State.tables.payments.type   = document.getElementById('payment-type-filter').value;
  State.tables.payments.page   = 1;
  loadPayments();
}

function exportPayments() { showToast('Exporting payment data…', 'info'); }

/* ─────────────────────────────────────────────
   REPORTS PAGE
───────────────────────────────────────────── */
function loadReportsPage() {
  // Set default date range (last 30 days)
  const to   = new Date();
  const from = new Date(); from.setDate(from.getDate() - 30);
  document.getElementById('report-to').value   = to.toISOString().split('T')[0];
  document.getElementById('report-from').value = from.toISOString().split('T')[0];
}

async function openReportDetail(type) {
  const titles = { revenue:'Revenue Report', rides:'Ride Analytics', drivers:'Driver Performance', users:'User Growth', payments:'Payment Summary', geo:'Geographic Report' };
  document.getElementById('report-preview-title').textContent = titles[type] || type;

  const data = type === 'rides' ? await ReportsAPI.getRideTrend('month') : await ReportsAPI.getRevenueTrend('month');
  renderReportChart(data, type);

  // Stats
  const statsEl = document.getElementById('report-stats');
  statsEl.innerHTML = [
    { label: 'Period Total', value: type === 'revenue' ? 'LKR 48.5M' : '1,482' },
    { label: 'vs Last Month', value: '+12.4%' },
    { label: 'Daily Average', value: type === 'revenue' ? 'LKR 1.6M' : '49.4' },
    { label: 'Peak Day', value: 'July 12' },
  ].map(s => `<div class="report-stat"><strong>${s.value}</strong><span>${s.label}</span></div>`).join('');

  document.getElementById('report-preview').style.display = 'block';
  document.getElementById('report-preview').scrollIntoView({ behavior: 'smooth' });
}

function renderReportChart(data, type) {
  const canvas = document.getElementById('report-chart');
  if (State.reportChart) State.reportChart.destroy();
  State.reportChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: 'rgba(245,166,35,.75)',
        borderColor: '#F5A623',
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#E2E6F0' }, ticks: { color: '#6B7A99', font: { family: 'DM Sans', size: 11 } } },
        x: { grid: { display: false }, ticks: { color: '#6B7A99', font: { family: 'DM Sans', size: 11 }, maxTicksLimit: 12 } },
      },
    }
  });
}

function closeReportPreview() {
  document.getElementById('report-preview').style.display = 'none';
  if (State.reportChart) { State.reportChart.destroy(); State.reportChart = null; }
}

function generateReport() { showToast('Generating report for selected date range…', 'info'); }
function exportReport()   { showToast('Downloading report as PDF…', 'info'); }

/* ─────────────────────────────────────────────
   ROLES & ACCESS PAGE
───────────────────────────────────────────── */
async function loadRoles() {
  const perms = [
    'view_dashboard','manage_rides','manage_users','manage_drivers',
    'view_payments','manage_payments','view_reports','generate_reports',
    'manage_roles','manage_settings','export_data'
  ];
  const permLabels = {
    view_dashboard:'View Dashboard', manage_rides:'Manage Rides', manage_users:'Manage Users',
    manage_drivers:'Manage Drivers', view_payments:'View Payments', manage_payments:'Manage Payments',
    view_reports:'View Reports', generate_reports:'Generate Reports', manage_roles:'Manage Roles',
    manage_settings:'Manage Settings', export_data:'Export Data',
  };

  // Render role cards
  const grid = document.getElementById('roles-grid');
  grid.innerHTML = Object.entries(RBACModule.roles).map(([key, role]) => `
    <div class="role-card">
      <div class="role-card-header">
        <div>
          <h3>${role.label}</h3>
          <p style="font-size:.78rem;color:#6B7A99;margin-top:.25rem">${role.description}</p>
        </div>
        <span class="role-badge ${key}">${key.replace('_',' ')}</span>
      </div>
      <div class="perm-list">
        ${perms.map(p => `<div class="perm-item ${role.permissions.includes(p) ? 'allowed' : ''}">${permLabels[p]}</div>`).join('')}
      </div>
    </div>`).join('');

  // Render admin users table
  const admins = await RBACModule.getAdmins();
  document.getElementById('admins-count').textContent = `${admins.length} admin users`;
  document.getElementById('admins-body').innerHTML = admins.map(a => `
    <tr>
      <td><strong>${a.name}</strong></td>
      <td style="color:#6B7A99">${a.email}</td>
      <td><span class="role-badge ${a.role}" style="font-size:.72rem">${a.role.replace('_',' ')}</span></td>
      <td style="font-size:.78rem;color:#6B7A99">${a.lastLogin}</td>
      <td>${badge(a.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="Edit">✏️</button>
          ${a.id !== 'A001' ? `<button class="btn-icon danger" title="Remove">🗑</button>` : ''}
        </div>
      </td>
    </tr>`).join('');
}

async function addAdmin() {
  const name  = document.getElementById('na-name').value.trim();
  const email = document.getElementById('na-email').value.trim();
  const role  = document.getElementById('na-role').value;
  if (!name || !email) { showToast('Name and email are required', 'error'); return; }
  await RBACModule.addAdmin({ name, email, role });
  closeModal();
  showToast('Admin user created successfully', 'success');
  loadRoles();
}

/* ─────────────────────────────────────────────
   SETTINGS PAGE
───────────────────────────────────────────── */
function saveSettings() {
  showToast('Platform settings saved successfully', 'success');
}

/* ─────────────────────────────────────────────
   PAGINATION HELPER
───────────────────────────────────────────── */
function renderPagination(tableKey, current, total) {
  const el = document.getElementById(`${tableKey}-pagination`);
  if (!el || total <= 1) { if (el) el.innerHTML = ''; return; }

  let html = `<button class="page-btn" ${current === 1 ? 'disabled' : ''} onclick="changePage('${tableKey}',${current - 1})">‹</button>`;
  for (let i = 1; i <= total; i++) {
    if (total > 7 && Math.abs(i - current) > 2 && i !== 1 && i !== total) {
      if (i === 2 || i === total - 1) html += `<button class="page-btn" disabled>…</button>`;
      continue;
    }
    html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage('${tableKey}',${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${current === total ? 'disabled' : ''} onclick="changePage('${tableKey}',${current + 1})">›</button>`;
  el.innerHTML = html;
}

function changePage(tableKey, page) {
  State.tables[tableKey].page = page;
  loadPage(State.currentPage);
}

/* ─────────────────────────────────────────────
   TABLE SORT
───────────────────────────────────────────── */
function sortTable(tableKey, col) {
  const t = State.tables[tableKey];
  t.dir = (t.sort === col && t.dir === 'asc') ? 'desc' : 'asc';
  t.sort = col;
  loadPage(State.currentPage);
}

/* ─────────────────────────────────────────────
   GLOBAL SEARCH
───────────────────────────────────────────── */
function globalSearch(q) {
  if (!q || q.length < 2) return;
  // Debounce and route to current page's search
  clearTimeout(window._searchTimer);
  window._searchTimer = setTimeout(() => {
    if (State.currentPage === 'rides') {
      document.getElementById('ride-search').value = q;
      filterRides();
    } else if (State.currentPage === 'users') {
      document.getElementById('user-search').value = q;
      filterUsers();
    } else if (State.currentPage === 'drivers') {
      document.getElementById('driver-search').value = q;
      filterDrivers();
    }
  }, 300);
}

/* ─────────────────────────────────────────────
   NOTIFICATIONS
───────────────────────────────────────────── */
function populateNotifications() {
  const list = document.getElementById('notif-list');
  list.innerHTML = MockDB.notifications.map(n => `
    <div class="notif-item">
      <div class="notif-item-icon">${n.icon}</div>
      <div class="notif-item-text">
        <strong>${n.text}</strong>
        <span>${n.time}</span>
      </div>
    </div>`).join('');
}

function toggleNotifications() {
  document.getElementById('notif-panel').classList.toggle('hidden');
}

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main    = document.getElementById('main-content');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    State.sidebarCollapsed = !State.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', State.sidebarCollapsed);
    main.classList.toggle('expanded', State.sidebarCollapsed);
  }
}

/* ─────────────────────────────────────────────
   MODAL SYSTEM
───────────────────────────────────────────── */
function openModal(name) {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  const modal = document.getElementById(`modal-${name}`);
  if (modal) modal.classList.remove('hidden');
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.getElementById('modal-overlay').classList.add('hidden');
}

/* ─────────────────────────────────────────────
   TOAST NOTIFICATIONS
───────────────────────────────────────────── */
let _toastTimer = null;
function showToast(msg, type = 'success') {
  const toast   = document.getElementById('toast');
  const msgEl   = document.getElementById('toast-msg');
  const iconEl  = document.getElementById('toast-icon');
  const icons   = { success: '✓', error: '✕', info: 'ℹ' };

  msgEl.textContent = msg;
  iconEl.textContent = icons[type] || '✓';
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

/* ─────────────────────────────────────────────
   CLOSE NOTIFICATION PANEL ON OUTSIDE CLICK
───────────────────────────────────────────── */
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notif-panel');
  const bell  = document.querySelector('.topbar-notif');
  if (!panel.classList.contains('hidden') && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.classList.add('hidden');
  }
});

/* ─────────────────────────────────────────────
   KEYBOARD SHORTCUTS
───────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); document.getElementById('notif-panel').classList.add('hidden'); }
  if (e.key === '/' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    document.getElementById('global-search').focus();
  }
});
