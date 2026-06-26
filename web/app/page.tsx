"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, TextField, Label, Input } from "@heroui/react";
import { fetchStats } from "@/lib/api";

interface Stats {
  locations: number;
  containers: number;
  items: number;
  recentItems: Array<{ name: string; description?: string }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    locations: 0,
    containers: 0,
    items: 0,
    recentItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Home Inventory</h1>
          <p className="text-foreground/60">Your home, organized.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onPress={() => (window.location.href = "/items")}>
            Manage Items
          </Button>
          <Button variant="primary" onPress={() => (window.location.href = "/add")}>
            + Add Item
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8 flex gap-3 items-end">
        <TextField
          className="flex-1"
          value={search}
          onChange={(e: any) => setSearch(typeof e === "string" ? e : e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && search.trim()) window.location.href = `/items?q=${encodeURIComponent(search.trim())}`;
          }}
        >
          <Label>Search</Label>
          <Input placeholder="Search items by name, description, or tag..." />
          <p className="text-sm text-foreground/40">Find anything in your inventory</p>
        </TextField>
        <Button
          variant="primary"
          isDisabled={!search.trim()}
          onPress={() => {
            if (search.trim()) window.location.href = `/items?q=${encodeURIComponent(search.trim())}`;
          }}
        >
          Search
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Card.Content>
                <div className="h-16 animate-pulse rounded bg-foreground/10" />
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-3 gap-4">
          <StatCard
            title="Containers"
            value={stats.containers}
            subtitle="active boxes"
            href="/containers"
          />
          <StatCard
            title="Items"
            value={stats.items}
            subtitle="tracked items"
            href="/items"
          />
          <StatCard
            title="Locations"
            value={stats.locations}
            subtitle="zones"
            href="/locations"
          />
        </div>
      )}

      {/* Recent items */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Items</Card.Title>
          <Card.Description>Last 5 items added</Card.Description>
        </Card.Header>
        <Card.Content>
          {loading ? (
            <div className="h-12 animate-pulse rounded bg-foreground/10" />
          ) : stats.recentItems.length === 0 ? (
            <p className="text-foreground/40">
              No items yet.{" "}
              <a href="/add" className="text-primary underline">
                Add your first item
              </a>{" "}
              or scan a QR code to get started.
            </p>
          ) : (
            <ul className="space-y-2">
              {stats.recentItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg bg-foreground/5 p-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-foreground/50">{item.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: number;
  subtitle: string;
  href: string;
}) {
  return (
    <a href={href}>
      <Card className="transition-shadow hover:shadow-lg">
        <Card.Header>
          <Card.Title>{title}</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-4xl font-bold">{value}</p>
          <p className="text-sm text-foreground/60">{subtitle}</p>
        </Card.Content>
      </Card>
    </a>
  );
}
