// ── DATA STORE ──
let employees = JSON.parse(localStorage.getItem('hr_employees') || '[]');
let interviews = JSON.parse(localStorage.getItem('hr_interviews') || '[]');

function saveData() {
  localStorage.setItem('hr_employees', JSON.stringify(employees));
  localStorage.setItem('hr_interviews', JSON.stringify(interviews));
}

// ── COLORS ──
const avatarColors = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#7c3aed','#0891b2','#be185d'];
function getAvatarColor(name) {
  let h = 0;
  for (let c of name) h += c.charCodeAt(0);
  return avatarColors[h % avatarColors.length];
}
function getInitials(name) {
  return name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
}

// ── NAVIGATION ──
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const titles = { dashboard: 'Dashboard', employees: 'Employees', 'add-employee': 'Add Employee', interviews: 'Interviews' };
  document.getElementById('page-title').textContent = titles[page] || page;
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  if (page === 'dashboard') renderDashboard();
  if (page === 'employees') renderEmployees();
  if (page === 'interviews') renderInterviews();
  if (page === 'add-employee') resetForm();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigate(item.dataset.page);
  });
});

// ── TOAST ──
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── DASHBOARD ──
function renderDashboard() {
  const now = new Date();
  const scheduled = interviews.filter(i => i.status === 'Scheduled');
  const upcoming = scheduled.filter(i => new Date(i.date + 'T' + i.time) >= now);
  const completed = interviews.filter(i => i.status === 'Completed');

  document.getElementById('stat-total').textContent = employees.length;
  document.getElementById('stat-scheduled').textContent = scheduled.length;
  document.getElementById('stat-upcoming').textContent = upcoming.length;
  document.getElementById('stat-completed').textContent = completed.length;

  // Recent employees
  const empList = document.getElementById('recent-employees-list');
  const recent = [...employees].slice(-5).reverse();
  if (recent.length === 0) {
    empList.innerHTML = '<div class="empty-state" style="padding:30px"><div class="empty-icon">👥</div><p>No employees yet</p></div>';
  } else {
    empList.innerHTML = recent.map(e => `
      <div class="recent-item">
        <div class="avatar" style="background:${getAvatarColor(e.name)}">${getInitials(e.name)}</div>
        <div class="recent-info">
          <div class="recent-name">${e.name}</div>
          <div class="recent-sub">${e.role} · ${e.experience}</div>
        </div>
        <span class="role-badge">${e.role.split(' ')[0]}</span>
      </div>`).join('');
  }

  // Upcoming interviews
  const intList = document.getElementById('upcoming-interviews-list');
  const upcomingAll = upcoming.slice(0, 5);
  if (upcomingAll.length === 0) {
    intList.innerHTML = '<div class="empty-state" style="padding:30px"><div class="empty-icon">📅</div><p>No upcoming interviews</p></div>';
  } else {
    intList.innerHTML = upcomingAll.map(i => {
      const emp = employees.find(e => e.id === i.employeeId);
      const d = new Date(i.date + 'T' + i.time);
      const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return `<div class="recent-item">
        <div class="avatar" style="background:${getAvatarColor(emp?.name || '?')}">${getInitials(emp?.name || '?')}</div>
        <div class="recent-info">
          <div class="recent-name">${emp?.name || 'Unknown'}</div>
          <div class="recent-sub">${i.type} · ${dateStr} at ${timeStr}</div>
        </div>
        <span class="status-badge scheduled"><span class="status-dot"></span>Soon</span>
      </div>`;
    }).join('');
  }
}

// ── EMPLOYEES ──
function renderEmployees(list) {
  const items = list || employees;
  const tbody = document.getElementById('employees-tbody');
  const empty = document.getElementById('emp-empty');

  if (items.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = items.map(e => {
    const skills = e.skills.split(',').map(s => s.trim()).filter(Boolean);
    const skillTags = skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('');
    const more = skills.length > 3 ? `<span class="skill-tag">+${skills.length - 3}</span>` : '';
    return `<tr>
      <td>
        <div class="emp-name-cell">
          <div class="avatar" style="background:${getAvatarColor(e.name)};width:34px;height:34px;font-size:11px">${getInitials(e.name)}</div>
          <div>
            <div class="emp-name-text">${e.name}</div>
            <div class="emp-email-text">${e.email}</div>
          </div>
        </div>
      </td>
      <td>${e.email}</td>
      <td><span class="role-badge">${e.role}</span></td>
      <td>${e.experience}</td>
      <td><div class="skills-cell">${skillTags}${more}</div></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon edit" onclick="openEditModal('${e.id}')" title="Edit">✏️</button>
          <button class="btn-icon delete" onclick="deleteEmployee('${e.id}')" title="Delete">🗑️</button>
          <button class="btn-icon schedule" onclick="openScheduleModal('${e.id}')" title="Schedule">📅</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterEmployees() {
  const search = document.getElementById('emp-search').value.toLowerCase();
  const role = document.getElementById('role-filter').value;
  const filtered = employees.filter(e =>
    (e.name.toLowerCase().includes(search) || e.email.toLowerCase().includes(search) || e.skills.toLowerCase().includes(search)) &&
    (!role || e.role === role)
  );
  renderEmployees(filtered);
}

// ── ADD / EDIT EMPLOYEE ──
function saveEmployee(e) {
  e.preventDefault();
  const emp = {
    id: Date.now().toString(),
    name: document.getElementById('emp-name').value.trim(),
    email: document.getElementById('emp-email').value.trim(),
    role: document.getElementById('emp-role').value,
    experience: document.getElementById('emp-experience').value,
    skills: document.getElementById('emp-skills').value.trim(),
    createdAt: new Date().toISOString()
  };
  employees.push(emp);
  saveData();
  showToast('✅ Employee added successfully!');
  document.getElementById('employee-form').reset();
  setTimeout(() => navigate('employees'), 600);
}

function resetForm() {
  document.getElementById('employee-form')?.reset();
  document.getElementById('form-title').textContent = 'Add New Employee';
}

function cancelForm() {
  navigate('employees');
}

function deleteEmployee(id) {
  if (!confirm('Delete this employee? Their interviews will also be removed.')) return;
  employees = employees.filter(e => e.id !== id);
  interviews = interviews.filter(i => i.employeeId !== id);
  saveData();
  showToast('🗑️ Employee deleted', 'error');
  renderEmployees();
}

// ── EDIT MODAL ──
function openEditModal(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;
  document.getElementById('modal-edit-id').value = id;
  document.getElementById('modal-emp-name').value = emp.name;
  document.getElementById('modal-emp-email').value = emp.email;
  document.getElementById('modal-emp-role').value = emp.role;
  document.getElementById('modal-emp-exp').value = emp.experience;
  document.getElementById('modal-emp-skills').value = emp.skills;
  document.getElementById('edit-modal').classList.add('open');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
}

function closeEditModalOutside(e) {
  if (e.target === document.getElementById('edit-modal')) closeEditModal();
}

function updateEmployee(e) {
  e.preventDefault();
  const id = document.getElementById('modal-edit-id').value;
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return;
  employees[idx] = {
    ...employees[idx],
    name: document.getElementById('modal-emp-name').value.trim(),
    email: document.getElementById('modal-emp-email').value.trim(),
    role: document.getElementById('modal-emp-role').value,
    experience: document.getElementById('modal-emp-exp').value,
    skills: document.getElementById('modal-emp-skills').value.trim()
  };
  saveData();
  closeEditModal();
  showToast('✅ Employee updated!');
  renderEmployees();
}

// ── SCHEDULE INTERVIEW ──
function openScheduleModal(empId) {
  const select = document.getElementById('int-employee');
  select.innerHTML = '<option value="">Choose Employee</option>' +
    employees.map(e => `<option value="${e.id}"${e.id === empId ? ' selected' : ''}>${e.name} — ${e.role}</option>`).join('');
  if (empId) select.value = empId;

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('int-date').min = today;
  document.getElementById('int-edit-id').value = '';
  document.getElementById('slot-error').style.display = 'none';
  document.getElementById('interview-form').reset();
  if (empId) select.value = empId;

  document.getElementById('schedule-modal').classList.add('open');
}

function closeScheduleModal() {
  document.getElementById('schedule-modal').classList.remove('open');
  document.getElementById('slot-error').style.display = 'none';
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('schedule-modal')) closeScheduleModal();
}

function saveInterview(e) {
  e.preventDefault();
  const empId = document.getElementById('int-employee').value;
  const date = document.getElementById('int-date').value;
  const time = document.getElementById('int-time').value;
  const type = document.querySelector('input[name="int-type"]:checked')?.value;
  const editId = document.getElementById('int-edit-id').value;

  if (!empId || !date || !time || !type) { showToast('Please fill all fields', 'error'); return; }

  // Check slot conflict (same date + time, excluding current edit)
  const conflict = interviews.some(i =>
    i.date === date && i.time === time && i.status === 'Scheduled' && i.id !== editId
  );

  if (conflict) {
    document.getElementById('slot-error').style.display = 'block';
    return;
  }

  document.getElementById('slot-error').style.display = 'none';

  if (editId) {
    const idx = interviews.findIndex(i => i.id === editId);
    if (idx !== -1) {
      interviews[idx] = { ...interviews[idx], employeeId: empId, date, time, type };
    }
  } else {
    interviews.push({
      id: Date.now().toString(),
      employeeId: empId,
      date, time, type,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    });
  }

  saveData();
  closeScheduleModal();
  showToast('📅 Interview scheduled!');
  if (document.getElementById('page-interviews').classList.contains('active')) renderInterviews();
  renderDashboard();
}

// ── INTERVIEWS ──
function renderInterviews(list) {
  const items = list || interviews;
  const tbody = document.getElementById('interviews-tbody');
  const empty = document.getElementById('int-empty');

  if (items.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const sorted = [...items].sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

  tbody.innerHTML = sorted.map(i => {
    const emp = employees.find(e => e.id === i.employeeId);
    const d = new Date(i.date + 'T' + i.time);
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const sc = i.status.toLowerCase();
    return `<tr>
      <td>
        <div class="emp-name-cell">
          <div class="avatar" style="background:${getAvatarColor(emp?.name||'?')};width:32px;height:32px;font-size:11px">${getInitials(emp?.name||'?')}</div>
          <div class="emp-name-text">${emp?.name || 'Unknown'}</div>
        </div>
      </td>
      <td><span class="role-badge">${emp?.role || '—'}</span></td>
      <td>${dateStr}</td>
      <td>${timeStr}</td>
      <td>${i.type}</td>
      <td><span class="status-badge ${sc}"><span class="status-dot"></span>${i.status}</span></td>
      <td>
        <div class="action-buttons">
          <select class="status-select" onchange="changeInterviewStatus('${i.id}', this.value)">
            <option value="Scheduled" ${i.status==='Scheduled'?'selected':''}>Scheduled</option>
            <option value="Completed" ${i.status==='Completed'?'selected':''}>Completed</option>
            <option value="Cancelled" ${i.status==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
          <button class="btn-icon delete" onclick="deleteInterview('${i.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterInterviews() {
  const status = document.getElementById('status-filter').value;
  const filtered = status ? interviews.filter(i => i.status === status) : interviews;
  renderInterviews(filtered);
}

function changeInterviewStatus(id, status) {
  const idx = interviews.findIndex(i => i.id === id);
  if (idx !== -1) {
    interviews[idx].status = status;
    saveData();
    showToast(`Status updated to ${status}`);
    filterInterviews();
    renderDashboard();
  }
}

function deleteInterview(id) {
  if (!confirm('Delete this interview?')) return;
  interviews = interviews.filter(i => i.id !== id);
  saveData();
  showToast('🗑️ Interview deleted', 'error');
  renderInterviews();
  renderDashboard();
}

// ── GLOBAL SEARCH ──
document.getElementById('global-search').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  if (!q) return;
  const active = document.querySelector('.page.active');
  if (active?.id === 'page-employees') {
    document.getElementById('emp-search').value = q;
    filterEmployees();
  }
});

// ── INIT ──
renderDashboard();
