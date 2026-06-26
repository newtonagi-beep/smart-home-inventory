"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button } from "@heroui/react";
import { fetchContainers } from "@/lib/api";

interface Container {
  id: string;
  name: string;
  description?: string;
  qr_token: string;
  status: string;
  location_id?: string;
}

export default function ContainersPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchContainers();
      setContainers(Array.isArray(data) ? data : []);
    } catch {
      setContainers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Containers</h1>
          <p className="text-foreground/60">{containers.length} active boxes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onPress={() => (window.location.href = "/")}>
            Dashboard
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-foreground/10" />
          ))}
        </div>
      ) : containers.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="py-8 text-center text-foreground/40">
              No containers yet. Add a location and container to get started.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {containers.map((c) => (
            <Card key={c.id}>
              <Card.Content>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    {c.description && (
                      <p className="text-sm text-foreground/50">{c.description}</p>
                    )}
                    <p className="mt-1 font-mono text-xs text-foreground/40">
                      QR: {c.qr_token.slice(0, 20)}...
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
