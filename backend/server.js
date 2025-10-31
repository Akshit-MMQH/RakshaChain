const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;
const SHIPMENTS_FILE = path.join(__dirname, 'shipments.json');
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA0M2Y2MGI1MGVhYzQxZjNiNWNiZDNjMDllYWQ4YWM1IiwiaCI6Im11cm11cjY0In0=';

// Prefer built-in fetch (Node 18+). If unavailable, try node-fetch dynamically.
let _fetch = global.fetch;
if (typeof _fetch !== 'function') {
  try {
    // Use node-fetch v2 (CommonJS) for compatibility with require()
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _fetch = require('node-fetch');
  } catch (_) {
    _fetch = null;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Initialize shipments.json if it doesn't exist
async function initializeShipmentsFile() {
  try {
    await fs.access(SHIPMENTS_FILE);
  } catch {
    await fs.writeFile(SHIPMENTS_FILE, JSON.stringify([], null, 2));
    console.log('Created shipments.json file');
  }
}

// Read shipments from file
async function readShipments() {
  try {
    const data = await fs.readFile(SHIPMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading shipments:', error);
    return [];
  }
}

// Write shipments to file
async function writeShipments(shipments) {
  try {
    await fs.writeFile(SHIPMENTS_FILE, JSON.stringify(shipments, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing shipments:', error);
    return false;
  }
}

// GET all shipments
app.get('/api/shipments', async (req, res) => {
  try {
    const shipments = await readShipments();
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// GET single shipment by ID
app.get('/api/shipments/:id', async (req, res) => {
  try {
    const shipments = await readShipments();
    const shipment = shipments.find(s => s.id === req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
});

// POST create new shipment
app.post('/api/shipments', async (req, res) => {
  try {
    const { name, id, supply, initLoc, finalLoc, date } = req.body;
    
    // Validate required fields
    if (!name || !id || !supply || !initLoc || !finalLoc || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const shipments = await readShipments();
    
    // Check if ID already exists
    if (shipments.some(s => s.id === id)) {
      return res.status(400).json({ error: 'Shipment ID already exists' });
    }
    
    const newShipment = {
      name,
      id,
      supply,
      initLoc,
      finalLoc,
      date,
      status: 'pending'
    };
    
    shipments.push(newShipment);
    const success = await writeShipments(shipments);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to save shipment' });
    }
    
    res.status(201).json(newShipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// PUT update shipment
app.put('/api/shipments/:id', async (req, res) => {
  try {
    console.log('Received PUT request for shipment:', req.params.id);
    console.log('Request body:', req.body);
    
    const { name, supply, initLoc, finalLoc, date, status } = req.body;
    const shipments = await readShipments();
    const index = shipments.findIndex(s => s.id === req.params.id);
    
    if (index === -1) {
      console.log('Shipment not found with ID:', req.params.id);
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    // Update shipment (keep the original ID)
    const currentShipment = shipments[index];
    console.log('Current shipment:', currentShipment);
    
    shipments[index] = {
      ...currentShipment,
      name: name || currentShipment.name,
      supply: supply || currentShipment.supply,
      initLoc: initLoc || currentShipment.initLoc,
      finalLoc: finalLoc || currentShipment.finalLoc,
      date: date || currentShipment.date,
      status: status || currentShipment.status || 'pending' // Use provided status, fallback to current, or default to pending
    };
    
    console.log('Updated shipment:', shipments[index]);
    
    const success = await writeShipments(shipments);
    
    if (!success) {
      console.error('Failed to write shipments to file');
      return res.status(500).json({ error: 'Failed to update shipment' });
    }
    
    console.log('Successfully updated shipment');
    res.json(shipments[index]);
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// DELETE shipment
app.delete('/api/shipments/:id', async (req, res) => {
  try {
    const shipments = await readShipments();
    const filteredShipments = shipments.filter(s => s.id !== req.params.id);
    
    if (shipments.length === filteredShipments.length) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    const success = await writeShipments(filteredShipments);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete shipment' });
    }
    
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

// --- Helpers for OpenRouteService ---
async function geocodeLocation(text) {
  if (!_fetch) throw new Error('fetch is not available on this Node version');
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(ORS_API_KEY)}&text=${encodeURIComponent(text)}&size=1`;
  const resp = await _fetch(url);
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Geocode failed: ${resp.status} ${t}`);
  }
  const data = await resp.json();
  if (!data.features || !data.features.length) throw new Error(`Location not found: ${text}`);
  const feat = data.features[0];
  return { coords: feat.geometry.coordinates, name: feat.properties.label };
}

async function getRouteORS(startCoords, endCoords, profile) {
  if (!_fetch) throw new Error('fetch is not available on this Node version');
  const url = `https://api.openrouteservice.org/v2/directions/${profile}`;
  const resp = await _fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      'Authorization': ORS_API_KEY,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ coordinates: [startCoords, endCoords] })
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Route failed: ${resp.status} ${t}`);
  }
  return await resp.json();
}

function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

function formatDistance(meters) {
  const km = (Number(meters) || 0) / 1000;
  return `${km.toFixed(2)} km`;
}

// POST /api/estimate  { startLocation, endLocation, mode }
app.post('/api/estimate', async (req, res) => {
  try {
    const { startLocation, endLocation, mode } = req.body || {};
    if (!startLocation || !endLocation) return res.status(400).json({ error: 'startLocation and endLocation are required' });
    const profile = mode || 'driving-car';

    const start = await geocodeLocation(startLocation);
    const end = await geocodeLocation(endLocation);
    const data = await getRouteORS(start.coords, end.coords, profile);

    if (!data.routes || !data.routes.length) return res.status(404).json({ error: 'No route found' });
    const route = data.routes[0];
    const duration = route.summary && route.summary.duration ? route.summary.duration : 0;
    const distance = route.summary && route.summary.distance ? route.summary.distance : 0;

    return res.json({
      startName: start.name,
      endName: end.name,
      duration,
      distance,
      durationFormatted: formatDuration(duration),
      distanceFormatted: formatDistance(distance),
      profile
    });
  } catch (e) {
    return res.status(500).json({ error: e && e.message ? e.message : 'Failed to estimate travel time' });
  }
});

// GET /api/shipments/:id/estimate?mode=driving-car
app.get('/api/shipments/:id/estimate', async (req, res) => {
  try {
    const profile = req.query.mode || 'driving-car';
    const shipments = await readShipments();
    const shipment = shipments.find(s => s.id === req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    if (!shipment.initLoc || !shipment.finalLoc) return res.status(400).json({ error: 'Shipment lacks initLoc/finalLoc' });

    const start = await geocodeLocation(shipment.initLoc);
    const end = await geocodeLocation(shipment.finalLoc);
    const data = await getRouteORS(start.coords, end.coords, profile);

    if (!data.routes || !data.routes.length) return res.status(404).json({ error: 'No route found' });
    const route = data.routes[0];
    const duration = route.summary && route.summary.duration ? route.summary.duration : 0;
    const distance = route.summary && route.summary.distance ? route.summary.distance : 0;

    return res.json({
      shipmentId: shipment.id,
      startName: start.name,
      endName: end.name,
      duration,
      distance,
      durationFormatted: formatDuration(duration),
      distanceFormatted: formatDistance(distance),
      profile
    });
  } catch (e) {
    return res.status(500).json({ error: e && e.message ? e.message : 'Failed to estimate travel time for shipment' });
  }
});

// Initialize and start server
initializeShipmentsFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Shipments file: ${SHIPMENTS_FILE}`);
  });
});