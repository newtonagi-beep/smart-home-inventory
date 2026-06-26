"use client";

import { useEffect, useState } from "react";
import { Card, Button, TextField, Label, Input } from "@heroui/react";
import { fetchLocations, fetchContainers, createItem } from "@/lib/api";

interface Location {
  id: string;
  name: string;
}

interface Container {
  id: string;
  name: string;
}

export default function AddItemPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [locationId, setLocationId] = useState("");
  const [containerId, setContainerId] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchLocations(),
      locationId ? fetchContainers(locationId) : Promise.resolve([]),
    ]).then(([locs, conts]) => {
      setLocations(locs);
      setContainers(conts as Container[]);
    });
  }, [locationId]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const result = await createItem({
        name: name.trim(),
        description: description.trim() || undefined,
        container_id: containerId || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      if (result.detail) {
        setError(typeof result.detail === "string" ? result.detail : "Failed to create item");
      } else {
        setDone(true);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create item");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <Card>
          <Card.Content className="py-12">
            <p className="mb-4 text-4xl">✅</p>
            <p className="mb-2 text-xl font-bold">Item added!</p>
            <p className="mb-6 text-foreground/60">{name}</p>
            <div className="flex justify-center gap-3">
              <Button variant="primary" onPress={() => window.location.reload()}>
                + Add Another
              </Button>
              <Button variant="secondary" onPress={() => (window.location.href = "/")}>
                Dashboard
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Item</h1>
        <p className="text-foreground/60">Track something in your inventory</p>
      </div>

      <Card>
        <Card.Content className="space-y-4">
          <TextField isRequired value={name} onChange={(e: any) => setName(e.target?.value || e)}>
            <Label>Name *</Label>
            <Input placeholder="e.g. Oregano, Screwdriver, USB cable" />
          </TextField>

          <TextField value={description} onChange={(e: any) => setDescription(e.target?.value || e)}>
            <Label>Description</Label>
            <Input placeholder="Optional — details about this item" />
          </TextField>

          <TextField value={tags} onChange={(e: any) => setTags(e.target?.value || e)}>
            <Label>Tags</Label>
            <Input placeholder="comma separated: herbs, kitchen, greek" />
          </TextField>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">
              Location (optional)
            </label>
            <select
              className="w-full rounded-lg border border-foreground/20 bg-transparent p-2 text-sm"
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                setContainerId("");
              }}
            >
              <option value="">-- Select Location --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {containers.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">
                Container (optional)
              </label>
              <select
                className="w-full rounded-lg border border-foreground/20 bg-transparent p-2 text-sm"
                value={containerId}
                onChange={(e) => setContainerId(e.target.value)}
              >
                <option value="">-- Select Container --</option>
                {containers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              isDisabled={!name.trim() || saving}
              onPress={handleSubmit}
            >
              {saving ? "Saving..." : "Add Item"}
            </Button>
            <Button variant="secondary" onPress={() => (window.location.href = "/")}>
              Cancel
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
