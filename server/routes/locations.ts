import { RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';

const LOCATIONS_FILE = path.join(process.cwd(), 'server', 'data', 'locations.json');

function readLocations(): any[] {
  try {
    if (!fs.existsSync(LOCATIONS_FILE)) return [];
    const raw = fs.readFileSync(LOCATIONS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Failed to read locations file:', e);
    return [];
  }
}

function writeLocations(data: any[]) {
  try {
    fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write locations file:', e);
  }
}

// GET /api/admin/locations?q=&page=&limit=
export const getLocations: RequestHandler = (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '100', 10);

    let locations = readLocations();

    if (q) {
      const qlc = q.toLowerCase();
      locations = locations.filter((l: any) => {
        const name = (l.name || l.place_name || '').toLowerCase();
        const tags = JSON.stringify(l.tags || {}).toLowerCase();
        return name.includes(qlc) || tags.includes(qlc);
      });
    }

    const total = locations.length;
    const start = (page - 1) * limit;
    const paged = locations.slice(start, start + limit);

    res.json({ success: true, total, page, limit, locations: paged });
  } catch (err) {
    console.error('Error in getLocations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/locations - add location
export const addLocation: RequestHandler = (req, res) => {
  try {
    const { id, name, place_name, center, tags } = req.body;
    if (!name || !center || !Array.isArray(center) || center.length < 2) {
      return res.status(400).json({ error: 'name and center [lon,lat] required' });
    }

    const locations = readLocations();
    const newId = id || `loc-${Date.now()}`;
    const item = { id: newId, name, place_name: place_name || name, center, tags: tags || {}, source: 'admin' };
    locations.push(item);
    writeLocations(locations);
    res.status(201).json({ success: true, location: item });
  } catch (err) {
    console.error('Error in addLocation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/locations/:id
export const updateLocation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const locations = readLocations();
    const idx = locations.findIndex((l: any) => l.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Location not found' });
    const updated = { ...locations[idx], ...payload };
    locations[idx] = updated;
    writeLocations(locations);
    res.json({ success: true, location: updated });
  } catch (err) {
    console.error('Error in updateLocation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/admin/locations/:id
export const deleteLocation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    let locations = readLocations();
    const idx = locations.findIndex((l: any) => l.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Location not found' });
    const deleted = locations.splice(idx, 1)[0];
    writeLocations(locations);
    res.json({ success: true, location: deleted });
  } catch (err) {
    console.error('Error in deleteLocation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default { getLocations, addLocation, updateLocation, deleteLocation };
