import { useEffect, useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

interface LocationItem {
  id: string;
  name: string;
  place_name?: string;
  center: [number, number];
  tags?: any;
}

export default function AdminLocations() {
  const [q, setQ] = useState('');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LocationItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState<{name:string, place_name?:string, lat?:number, lon?:number}>({ name: '', place_name: '', lat: undefined, lon: undefined });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/locations?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setLocations(data.locations || []);
      } else {
        setMessage(data.error || 'Failed to load locations');
      }
    } catch (err) {
      setMessage('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [q, page]);

  const handleEdit = (loc: LocationItem) => {
    setSelected(loc);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/locations/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Saved');
        fetchLocations();
      } else setMessage(data.error || 'Save failed');
    } catch (e) {
      setMessage('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Deleted');
        fetchLocations();
      } else {
        const d = await res.json();
        setMessage(d.error || 'Delete failed');
      }
    } catch (e) {
      setMessage('Delete failed');
    }
  };

  const handleAdd = async () => {
    if (!newLocation.name || !newLocation.lat || !newLocation.lon) return setMessage('Name and coordinates required');
    try {
      const payload = { name: newLocation.name, place_name: newLocation.place_name, center: [newLocation.lon, newLocation.lat] };
      const res = await fetch('/api/admin/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (res.ok) {
        setMessage('Added');
        setNewLocation({ name: '', place_name: '', lat: undefined, lon: undefined });
        fetchLocations();
      } else setMessage(d.error || 'Add failed');
    } catch (e) {
      setMessage('Add failed');
    }
  };

  const handleChangeSelected = (k: keyof LocationItem, v: any) => {
    if (!selected) return;
    setSelected({ ...selected, [k]: v } as LocationItem);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Locations Admin</h2>
      <div className="mb-4 flex gap-2">
        <Input placeholder="Search name or tag" value={q} onChange={(e:any)=>setQ(e.target.value)} />
        <Button onClick={()=>{ setPage(1); fetchLocations(); }} className="bg-rocs-green">Search</Button>
      </div>

      {message && <div className="mb-3 text-sm text-gray-700">{message}</div>}

      <div className="overflow-auto max-h-[60vh] border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Place name</th>
              <th className="text-left p-2">Lat</th>
              <th className="text-left p-2">Lon</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border-b">
                <td className="p-2">{loc.name}</td>
                <td className="p-2">{loc.place_name || ''}</td>
                <td className="p-2">{loc.center?.[1]?.toFixed?.(6) || ''}</td>
                <td className="p-2">{loc.center?.[0]?.toFixed?.(6) || ''}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <Button onClick={()=>handleEdit(loc)} className="bg-rocs-green">Edit</Button>
                    <Button onClick={()=>handleDelete(loc.id)} className="bg-red-600">Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
        <div className="px-3 py-2">Page {page}</div>
        <Button onClick={()=>setPage(p=>p+1)}>Next</Button>
      </div>

      {/* Add new location */}
      <div className="mt-6 border rounded p-4 bg-white">
        <h3 className="font-semibold mb-2">Add new location</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="new-name">Name</Label>
            <Input id="new-name" value={newLocation.name} onChange={(e:any)=>setNewLocation(n=>({...n, name: e.target.value}))} />
          </div>
          <div>
            <Label htmlFor="new-place">Place name</Label>
            <Input id="new-place" value={newLocation.place_name} onChange={(e:any)=>setNewLocation(n=>({...n, place_name: e.target.value}))} />
          </div>
          <div>
            <Label htmlFor="new-lat">Latitude</Label>
            <Input id="new-lat" value={newLocation.lat||''} onChange={(e:any)=>setNewLocation(n=>({...n, lat: parseFloat(e.target.value||'0')}))} />
          </div>
          <div>
            <Label htmlFor="new-lon">Longitude</Label>
            <Input id="new-lon" value={newLocation.lon||''} onChange={(e:any)=>setNewLocation(n=>({...n, lon: parseFloat(e.target.value||'0')}))} />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleAdd} className="bg-rocs-green">Add Location</Button>
        </div>
      </div>

      {/* Editor */}
      {selected && (
        <div className="mt-6 border rounded p-4 bg-white">
          <h3 className="font-semibold mb-2">Edit location: {selected.id}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={selected.name} onChange={(e:any)=>handleChangeSelected('name', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="place">Place name</Label>
              <Input id="place" value={selected.place_name || ''} onChange={(e:any)=>handleChangeSelected('place_name', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" value={selected.center?.[1]} onChange={(e:any)=>handleChangeSelected('center', [selected.center?.[0] || 0, parseFloat(e.target.value || '0')])} />
            </div>
            <div>
              <Label htmlFor="lon">Longitude</Label>
              <Input id="lon" value={selected.center?.[0]} onChange={(e:any)=>handleChangeSelected('center', [parseFloat(e.target.value || '0'), selected.center?.[1] || 0])} />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleSave} className="bg-rocs-green">Save</Button>
            <Button onClick={()=>setSelected(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
