// ─── PAGE NAVIGATION ────────────────────────────────────────────────────────
const pageTitles = {
  dashboard: 'Dashboard',
  devices: 'Devices',
  scanner: 'Port Scanner',
  events: 'Event Log',
  users: 'Users',
  audit: 'Audit Log'
};

function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('pg-' + id).classList.remove('hidden');
  btn.classList.add('active');
  document.getElementById('page-title').textContent = pageTitles[id];
}

// ─── LIVE CLOCK ─────────────────────────────────────────────────────────────
function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('en-GB');
}
updateClock();
setInterval(updateClock, 1000);

// ─── TOAST ──────────────────────────────────────────────────────────────────
function showToast(msg, type) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { if (t.parentNode) t.remove(); }, 3000);
}

// ─── DEVICES DATA ────────────────────────────────────────────────────────────
const devices = [
  { name: 'Core Router',    ip: '192.168.1.1',  type: 'router',   location: 'Server Room A', status: 'online',  latency: 2.3  },
  { name: 'Main Switch',    ip: '192.168.1.2',  type: 'switch',   location: 'Server Room A', status: 'online',  latency: 1.1  },
  { name: 'Web Server',     ip: '192.168.1.10', type: 'server',   location: 'Rack 2',        status: 'online',  latency: 5.7  },
  { name: 'DB Server',      ip: '192.168.1.11', type: 'server',   location: 'Rack 2',        status: 'online',  latency: 4.2  },
  { name: 'Firewall',       ip: '10.0.0.1',     type: 'firewall', location: 'DMZ',           status: 'online',  latency: 3.8  },
  { name: 'Backup Server',  ip: '10.0.0.5',     type: 'server',   location: 'Rack 3',        status: 'online',  latency: 890  },
  { name: 'Dev PC-01',      ip: '192.168.1.5',  type: 'host',     location: 'Office',        status: 'offline', latency: null },
  { name: 'Printer-01',     ip: '192.168.1.50', type: 'printer',  location: 'Office',        status: 'offline', latency: null },
];

function latencyColor(ms) {
  if (ms === null) return '';
  if (ms < 10)  return 'color:var(--green)';
  if (ms < 100) return 'color:var(--yellow)';
  return 'color:var(--red)';
}

function renderDevices(list) {
  const tbody = document.getElementById('dev-tbody');
  if (!tbody) return;
  tbody.innerHTML = list.map(d => `
    <tr>
      <td style="font-weight:600">${d.name}</td>
      <td><span class="mono teal" style="font-size:13px">${d.ip}</span></td>
      <td class="muted" style="font-size:12px;text-transform:capitalize">${d.type}</td>
      <td class="muted" style="font-size:12px">${d.location}</td>
      <td><span class="badge ${d.status === 'online' ? 'b-online' : 'b-offline'}">${d.status}</span></td>
      <td>
        ${d.latency !== null
          ? `<span class="mono" style="font-size:12px;${latencyColor(d.latency)}">${d.latency}ms</span>`
          : `<span class="muted">--</span>`}
      </td>
      <td class="muted" style="font-size:11px">${new Date().toLocaleString()}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="pingDevice('${d.name}','${d.ip}')">Ping</button>
          <button class="btn btn-danger btn-sm" onclick="showToast('Device ${d.name} deleted','s')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
  document.getElementById('dev-count').textContent = 'Devices (' + list.length + ')';
}

function filterDevices(q) {
  const filtered = devices.filter(d =>
    d.name.toLowerCase().includes(q.toLowerCase()) || d.ip.includes(q)
  );
  renderDevices(filtered);
}

function pingDevice(name, ip) {
  showToast('Pinging ' + ip + '...', 's');
  setTimeout(() => {
    const ms = (Math.random() * 20 + 1).toFixed(1);
    showToast(ip + ': online (' + ms + 'ms)', 's');
  }, 1200);
}

function pingAll() {
  showToast('Pinging all ' + devices.length + ' devices...', 's');
  setTimeout(() => showToast('Ping complete: 6 online, 2 offline', 's'), 2000);
}

renderDevices(devices);

// ─── EVENTS DATA ─────────────────────────────────────────────────────────────
const events = [
  { time: '16:15:02', type: 'ping',         sev: 'info',     msg: 'Ping 192.168.1.1: online (2.3ms)',              ip: '192.168.1.1'  },
  { time: '16:14:48', type: 'port_scan',    sev: 'info',     msg: 'Port scan on 192.168.1.10: 3 open ports',       ip: '192.168.1.10' },
  { time: '16:14:30', type: 'ping',         sev: 'warning',  msg: 'Ping 192.168.1.5: offline',                     ip: '192.168.1.5'  },
  { time: '16:13:55', type: 'ping',         sev: 'critical', msg: 'High latency detected: 890ms on 10.0.0.5',      ip: '10.0.0.5'     },
  { time: '16:13:10', type: 'login',        sev: 'info',     msg: 'User cyprian logged in',                        ip: '127.0.0.1'    },
  { time: '16:12:05', type: 'login',        sev: 'info',     msg: 'User jane logged in',                           ip: '10.0.0.2'     },
  { time: '16:11:40', type: 'ping',         sev: 'info',     msg: 'Ping 192.168.1.2: online (1.1ms)',              ip: '192.168.1.2'  },
  { time: '16:10:30', type: 'device_added', sev: 'info',     msg: 'Device Backup Server (10.0.0.5) added',         ip: '10.0.0.5'     },
  { time: '16:09:55', type: 'ping',         sev: 'warning',  msg: 'Ping 192.168.1.50: offline',                    ip: '192.168.1.50' },
  { time: '16:09:10', type: 'port_scan',    sev: 'info',     msg: 'Port scan on 10.0.0.1: 5 open ports',           ip: '10.0.0.1'     },
  { time: '16:08:00', type: 'ping',         sev: 'critical', msg: 'Device 192.168.1.5 went offline unexpectedly',  ip: '192.168.1.5'  },
  { time: '16:07:30', type: 'login',        sev: 'info',     msg: 'User alice logged in',                          ip: '192.168.1.100'},
];

function sevClass(sev) {
  if (sev === 'info')     return 'b-info';
  if (sev === 'warning')  return 'b-warn';
  if (sev === 'critical') return 'b-crit';
  return 'b-info';
}

function renderEvents(list) {
  const tbody = document.getElementById('ev-tbody');
  if (!tbody) return;
  tbody.innerHTML = list.map(e => `
    <tr>
      <td class="mono muted xs">${e.time}</td>
      <td><span class="mono" style="font-size:11px;color:var(--text2)">${e.type}</span></td>
      <td><span class="badge ${sevClass(e.sev)}">${e.sev}</span></td>
      <td style="color:var(--text2);font-size:13px;max-width:300px">${e.msg}</td>
      <td><span class="mono teal" style="font-size:12px">${e.ip}</span></td>
    </tr>
  `).join('');
  document.getElementById('ev-count').textContent = 'Event Log (' + list.length + ')';
}

function filterEvents(q) {
  const filtered = events.filter(e =>
    e.msg.toLowerCase().includes(q.toLowerCase()) ||
    e.ip.includes(q) ||
    e.type.toLowerCase().includes(q.toLowerCase())
  );
  renderEvents(filtered);
}

function filterEventSev(sev) {
  const filtered = sev === 'all' ? events : events.filter(e => e.sev === sev);
  renderEvents(filtered);
}

renderEvents(events);

// ─── PORT SCANNER ─────────────────────────────────────────────────────────────
const fakePorts = {
  '192.168.1.1':  [{ port: 22, service: 'ssh' }, { port: 80, service: 'http' }, { port: 443, service: 'https' }],
  '192.168.1.2':  [{ port: 22, service: 'ssh' }, { port: 161, service: 'snmp' }],
  '192.168.1.10': [{ port: 22, service: 'ssh' }, { port: 80, service: 'http' }, { port: 443, service: 'https' }, { port: 8080, service: 'http-alt' }],
  '192.168.1.11': [{ port: 22, service: 'ssh' }, { port: 3306, service: 'mysql' }, { port: 5432, service: 'postgresql' }],
  '10.0.0.1':     [{ port: 22, service: 'ssh' }, { port: 443, service: 'https' }, { port: 8443, service: 'https-alt' }, { port: 9000, service: 'unknown' }, { port: 9090, service: 'unknown' }],
  '10.0.0.5':     [{ port: 22, service: 'ssh' }, { port: 873, service: 'rsync' }, { port: 2049, service: 'nfs' }],
};

function setPreset(start, end) {
  document.getElementById('scan-start').value = start;
  document.getElementById('scan-end').value = end;
}

function runScan() {
  const ip    = document.getElementById('scan-ip').value.trim();
  const start = document.getElementById('scan-start').value;
  const end   = document.getElementById('scan-end').value;

  if (!ip) { showToast('Enter a target IP first', 'e'); return; }

  const btn = document.getElementById('scan-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Scanning...';

  document.getElementById('scan-results').innerHTML = `
    <div style="text-align:center;padding:20px;color:var(--text2);font-size:13px">
      Scanning ${ip} ports ${start}–${end}...
    </div>
    <div class="scanning-bar">
      <div class="scanning-bar-inner" id="scan-prog" style="width:0%"></div>
    </div>`;

  let prog = 0;
  const iv = setInterval(() => {
    prog += Math.random() * 12;
    if (prog > 95) prog = 95;
    const el = document.getElementById('scan-prog');
    if (el) el.style.width = Math.round(prog) + '%';
  }, 200);

  setTimeout(() => {
    clearInterval(iv);
    btn.disabled = false;
    btn.innerHTML = '⊕ Scan Now';

    const ports = fakePorts[ip] || [{ port: 22, service: 'ssh' }, { port: 80, service: 'http' }];

    const rows = ports.map(p => `
      <tr>
        <td><span class="mono teal" style="font-weight:700;font-size:14px">${p.port}</span></td>
        <td style="text-transform:uppercase;font-size:12px;color:var(--text2)">${p.service}</td>
        <td><span class="badge b-info">TCP</span></td>
      </tr>
    `).join('');

    document.getElementById('scan-results').innerHTML = `
      <div class="result-summary">
        <div class="result-box">
          <div class="result-box-label">Target</div>
          <div class="result-box-val teal" style="font-size:15px">${ip}</div>
        </div>
        <div class="result-box">
          <div class="result-box-label">Open Ports</div>
          <div class="result-box-val" style="color:var(--green)">${ports.length}</div>
        </div>
        <div class="result-box">
          <div class="result-box-label">Range</div>
          <div class="result-box-val" style="font-size:14px;color:var(--text2)">${start}–${end}</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Port</th><th>Service</th><th>Protocol</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    showToast('Scan complete: ' + ports.length + ' open ports on ' + ip, 's');
  }, 2800);
}
