const Animal = require('../models/Animal');

exports.renderAdminDashboard = (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Wildlife Archive - Server Admin Console</title>
  <meta name="referrer" content="no-referrer">
  <style>
    :root {
      --bg: #0c0c0e;
      --card: #18181b;
      --text: #d4c8b8;
      --accent: #6b21a8;
      --border: #2a2824;
      --danger: #dc2626;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 30px;
    }
    h1 { margin-top: 0; color: #fff; }
    .container { max-width: 1200px; margin: 0 auto; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    input, select, textarea, button {
      background: #0c0c0e;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 10px;
      border-radius: 4px;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
    }
    button.btn-primary {
      background: var(--accent);
      color: #fff;
      font-weight: bold;
      cursor: pointer;
      border: none;
      padding: 12px;
    }
    button.btn-primary:hover { opacity: 0.9; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 10px;
      text-align: left;
      font-size: 0.9rem;
    }
    th { background: #121214; }
    .thumbnail {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
    }
    .btn-delete {
      background: var(--danger);
      color: #fff;
      border: none;
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
      width: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚔️ Wildlife Archive Server Admin Console</h1>
    
    <!-- Add Specimen Form -->
    <div class="card">
      <h2 style="margin-top:0;">Add New Specimen</h2>
      <form id="addForm">
        <div class="form-grid">
          <div>
            <label>Name:</label>
            <input type="text" id="name" required placeholder="e.g. Cave Bear">
          </div>
          <div>
            <label>Class:</label>
            <input type="text" id="animalClass" value="Mammalia">
          </div>
          <div>
            <label>Diet:</label>
            <select id="diet">
              <option value="Carnivore">Carnivore</option>
              <option value="Herbivore">Herbivore</option>
              <option value="Omnivore">Omnivore</option>
            </select>
          </div>
          <div>
            <label>Habitat:</label>
            <select id="habitat">
              <option value="Terrestrial">Terrestrial</option>
              <option value="Marine">Marine</option>
              <option value="Freshwater">Freshwater</option>
              <option value="Aerial">Aerial</option>
            </select>
          </div>
          <div>
            <label>Mass (kg):</label>
            <input type="number" id="massKg" value="400">
          </div>
          <div>
            <label>Era (0-3):</label>
            <input type="number" id="era" value="3">
          </div>
          <div>
            <label>Time Period:</label>
            <input type="text" id="timePeriod" value="Pleistocene">
          </div>
          <div>
            <label>Image URL:</label>
            <input type="text" id="imageUrl" placeholder="https://images.unsplash.com/...">
          </div>
        </div>

        <div style="margin-top: 15px;">
          <label>Description:</label>
          <textarea id="description" rows="2" placeholder="Brief ecological summary..."></textarea>
        </div>

        <div style="margin-top: 15px;">
          <button type="submit" class="btn-primary">Add Specimen to MongoDB</button>
        </div>
      </form>
    </div>

    <!-- Active Records Table -->
    <div class="card">
      <h2 style="margin-top:0;">Archived Specimens</h2>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Class</th>
            <th>Diet</th>
            <th>Period</th>
            <th>Mass</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="specimenTable">
          <tr><td colspan="7">Loading records...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    async function loadTable() {
      const res = await fetch('/animals?limit=100');
      const data = await res.json();
      const list = data.animals || data;
      const tbody = document.getElementById('specimenTable');
      
      tbody.innerHTML = list.map(a => \`
        <tr>
          <td>
            \${a.imageUrl ? \`<img src="\${a.imageUrl}" class="thumbnail" />\` : 'No Img'}
          </td>
          <td><strong>\${a.name}</strong></td>
          <td>\${a.animalClass}</td>
          <td>\${a.diet}</td>
          <td>\${a.timePeriod || 'N/A'}</td>
          <td>\${a.massKg ? a.massKg + ' kg' : 'N/A'}</td>
          <td>
            <button class="btn-delete" onclick="deleteSpecimen('\${a._id}', '\${a.name}')">Delete</button>
          </td>
        </tr>
      \`).join('');
    }

    async function deleteSpecimen(id, name) {
      if (!confirm('Are you sure you want to delete ' + name + '?')) return;
      await fetch('/animals/' + id, { method: 'DELETE' });
      loadTable();
    }

    document.getElementById('addForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('name').value,
        animalClass: document.getElementById('animalClass').value,
        diet: document.getElementById('diet').value,
        habitat: document.getElementById('habitat').value,
        massKg: Number(document.getElementById('massKg').value),
        era: Number(document.getElementById('era').value),
        timePeriod: document.getElementById('timePeriod').value,
        imageUrl: document.getElementById('imageUrl').value,
        description: document.getElementById('description').value,
        stats: { size: 5, speed: 5, strength: 5, defense: 5, aggression: 5, intelligence: 5 }
      };

      const res = await fetch('/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Specimen created successfully!');
        e.target.reset();
        loadTable();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.message || 'Failed to save'));
      }
    });

    loadTable();
  </script>
</body>
</html>
  `);
};