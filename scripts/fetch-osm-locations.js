import fs from 'fs/promises';

// Fetch OSM data in tiles and merge with existing front-end locations
// Usage: node scripts/fetch-osm-locations.js

const SIMPLE_PICKER_PATH = 'client/components/SimpleMapboxLocationPicker.tsx';
const OUT_PATH = 'server/data/locations.json';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseInitialLocations(src) {
  const regex = /\{\s*id:\s*"([^"]+)",\s*place_name:\s*"([^"]+)",\s*center:\s*\[([^\]]+)\],\s*text:\s*"([^"]+)"\s*\}/g;
  const res = [];
  let m;
  while ((m = regex.exec(src))) {
    const [, id, place_name, centerStr, text] = m;
    const parts = centerStr.split(',').map((s) => parseFloat(s.trim()));
    // center in file is [lon, lat]
    const lon = parts[0];
    const lat = parts[1];
    res.push({ id, place_name, name: text || place_name, center: [lon, lat], source: 'frontend' });
  }
  return res;
}

function uniqueKey(item) {
  const name = (item.name || item.place_name || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const lat = item.center && item.center[1] ? item.center[1].toFixed(5) : '0';
  const lon = item.center && item.center[0] ? item.center[0].toFixed(5) : '0';
  return `${name}__${lat}__${lon}`;
}

async function queryOverpass(bbox) {
  // bbox: [south, west, north, east]
  const [s, w, n, e] = bbox;
  const q = `[out:json][timeout:25];(node(${s},${w},${n},${e})[\"name\"];way(${s},${w},${n},${e})[\"name\"];node(${s},${w},${n},${e})[\"amenity\"];way(${s},${w},${n},${e})[\"amenity\"];node(${s},${w},${n},${e})[\"shop\"];way(${s},${w},${n},${e})[\"shop\"];node(${s},${w},${n},${e})[\"building\"];way(${s},${w},${n},${e})[\"building\"];);out center qt;`;
  const body = new URLSearchParams({ data: q });
  try {
    const res = await fetch(OVERPASS_URL, { method: 'POST', body });
    if (!res.ok) {
      console.error('Overpass request failed', res.status, await res.text());
      return [];
    }
    const json = await res.json();
    if (!json.elements) return [];

    const items = json.elements.map((el) => {
      const tags = el.tags || {};
      const name = tags.name || tags['official_name'] || tags['addr:housename'] || tags['short_name'];
      if (!name) return null;
      let lon = el.lon;
      let lat = el.lat;
      if (!lon || !lat) {
        if (el.type === 'way' && el.center) {
          lon = el.center.lon; lat = el.center.lat;
        } else if (el.center) {
          lon = el.center[0]; lat = el.center[1];
        }
      }
      if (!lon || !lat) return null;
      return {
        id: `osm-${el.type}-${el.id}`,
        name,
        place_name: tags['name:en'] || name,
        center: [parseFloat(lon), parseFloat(lat)],
        tags,
        source: 'overpass'
      };
    }).filter(Boolean);

    return items;
  } catch (err) {
    console.error('Overpass fetch error', err.message || err);
    return [];
  }
}

async function main() {
  console.log('Reading frontend location file to seed...');
  let initialSrc = '';
  try {
    initialSrc = await fs.readFile(SIMPLE_PICKER_PATH, 'utf-8');
  } catch (e) {
    console.warn('Could not read simple picker file:', SIMPLE_PICKER_PATH);
  }
  const seed = parseInitialLocations(initialSrc);
  console.log(`Parsed ${seed.length} seed locations from frontend.`);

  // load existing locations.json
  let existing = [];
  try {
    const raw = await fs.readFile(OUT_PATH, 'utf-8');
    existing = JSON.parse(raw || '[]');
  } catch (e) {
    existing = [];
  }

  // merge seed into existing
  const map = new Map();
  existing.concat(seed).forEach((it) => map.set(uniqueKey(it), it));

  // Define bbox covering Nairobi+Kiambu (south, west, north, east)
  const minLat = -1.40; const maxLat = -0.90; const minLon = 36.60; const maxLon = 37.10;
  const rows = 3; const cols = 3;
  const latStep = (maxLat - minLat) / rows;
  const lonStep = (maxLon - minLon) / cols;

  const bboxes = [];
  for (let r=0;r<rows;r++){
    for (let c=0;c<cols;c++){
      const s = (minLat + r*latStep).toFixed(6);
      const n = (minLat + (r+1)*latStep).toFixed(6);
      const w = (minLon + c*lonStep).toFixed(6);
      const e = (minLon + (c+1)*lonStep).toFixed(6);
      bboxes.push([s,w,n,e]);
    }
  }

  console.log('Will query Overpass for', bboxes.length, 'tiles. This may take a few minutes.');

  for (let i=0;i<bboxes.length;i++){
    const bbox = bboxes[i];
    console.log(`Querying tile ${i+1}/${bboxes.length}: bbox=${bbox.join(',')}`);
    const items = await queryOverpass(bbox);
    console.log(' -> found', items.length, 'items');
    items.forEach((it) => {
      const key = uniqueKey(it);
      if (!map.has(key)) map.set(key, it);
    });
    // be polite
    await sleep(1500);
  }

  const merged = Array.from(map.values());
  console.log('Total merged locations:', merged.length);
  await fs.writeFile(OUT_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  console.log('Wrote', OUT_PATH);
}

main().catch((e)=>{ console.error('script error', e); process.exit(1); });
