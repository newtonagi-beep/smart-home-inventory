/// <reference types="react/experimental" />

const API = "http://localhost:8000/api/v1";

export async function fetchStats() {
  const [locations, containers, items] = await Promise.all([
    fetch(`${API}/locations`).then((r) => r.json()),
    fetch(`${API}/containers`).then((r) => r.json()),
    fetch(`${API}/items/search?q=`).then((r) => r.json()).catch(() => []),
  ]);
  return {
    locations: locations.length,
    containers: containers.length,
    items: Array.isArray(items) ? items.length : 0,
    recentItems: Array.isArray(items) ? items.slice(0, 5) : [],
  };
}

export async function fetchLocations() {
  const res = await fetch(`${API}/locations`);
  return res.json();
}

export async function createLocation(name: string, description?: string) {
  const res = await fetch(`${API}/locations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  return res.json();
}

export async function fetchContainers(locationId?: string) {
  const params = locationId ? `?location_id=${locationId}` : "";
  const res = await fetch(`${API}/containers${params}`);
  return res.json();
}

export async function createContainer(data: {
  name: string;
  description?: string;
  location_id: string;
}) {
  const res = await fetch(`${API}/containers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, qr_token: crypto.randomUUID() }),
  });
  return res.json();
}

export async function fetchItems(search?: string) {
  const q = search ? `?q=${encodeURIComponent(search)}` : "?q=";
  const res = await fetch(`${API}/items/search${q}`);
  return res.json();
}

export async function createItem(data: {
  name: string;
  description?: string;
  container_id?: string;
  tags?: string[];
}) {
  const res = await fetch(`${API}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
