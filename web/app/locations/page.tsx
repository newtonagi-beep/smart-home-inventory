"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, TextField, Label, Input } from "@heroui/react";
import { fetchLocations, createLocation } from "@/lib/api";

interface Location {
  id: string;
  name: string;
  description?: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchLocations();
      setLocations(Array.isArray(data) ? data : []);
    } catch {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await createLocation(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
      await load();
    } catch {
      // silent
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Locations</h1>
          <p className="text-foreground/60">{locations.length} zone(s)</p>
        </div>
        <Button variant="secondary" onPress={() => (window.location.href = "/")}>
          Dashboard
        </Button>
      </div>

      {/* Add location form */}
      <Card className="mb-6">
        <Card.Content>
          <p className="mb-3 text-sm font-medium">Add Location</p>
          <div className="flex gap-3 items-end">
            <TextField
              className="flex-1"
              value={name}
              onChange={(e: any) => setName(typeof e === "string" ? e : e.target.value)}
            >
              <Label>Name</Label>
              <Input placeholder="e.g. Kitchen, Garage, Office" />
            </TextField>
            <TextField
              className="flex-1"
              value={description}
              onChange={(e: any) => setDescription(typeof e === "string" ? e : e.target.value)}
            >
              <Label>Description</Label>
              <Input placeholder="Optional" />
            </TextField>
            <Button
              variant="primary"
              isDisabled={!name.trim() || adding}
              onPress={handleAdd}
            >
              Add
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Location list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-foreground/10" />
          ))}
        </div>
      ) : locations.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="py-8 text-center text-foreground/40">
              No locations yet. Add your first zone above.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <Card.Content>
                <p className="font-medium">{loc.name}</p>
                {loc.description && (
                  <p className="text-sm text-foreground/50">{loc.description}</p>
                )}
                <p className="mt-1 font-mono text-xs text-foreground/40">{loc.id.slice(0, 8)}...</p>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
