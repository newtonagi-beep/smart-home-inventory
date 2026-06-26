"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Button, TextField, Label, Input } from "@heroui/react";
import { fetchItems } from "@/lib/api";

interface Item {
  item_id: string;
  name: string;
  description?: string;
  score: number;
  match_type: string;
}

function ItemsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (queryStr: string) => {
    setLoading(true);
    try {
      const data = await fetchItems(queryStr);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(q);
  }, [q, search]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Items</h1>
          <p className="text-foreground/60">{items.length} result(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onPress={() => (window.location.href = "/")}>
            Dashboard
          </Button>
          <Button variant="primary" onPress={() => (window.location.href = "/add")}>
            + Add
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-3 items-end">
        <TextField className="flex-1" value={query} onChange={(e: any) => setQuery(e.target?.value || e)}>
          <Label>Search</Label>
          <Input
            placeholder="Search by name, description..."
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" && query.trim()) {
                window.location.href = `/items?q=${encodeURIComponent(query.trim())}`;
              }
            }}
          />
        </TextField>
        <Button
          variant="primary"
          isDisabled={!query.trim()}
          onPress={() => {
            if (query.trim()) window.location.href = `/items?q=${encodeURIComponent(query.trim())}`;
          }}
        >
          Search
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-foreground/10" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="py-8 text-center text-foreground/40">
              {q ? "No items match your search." : "No items yet. Start by adding one!"}
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <Card key={item.item_id || i}>
              <Card.Content>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-foreground/50">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {item.match_type}
                    </span>
                    <span className="text-xs text-foreground/40">{item.score.toFixed(2)}</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl p-6">
          <div className="h-8 w-48 animate-pulse rounded bg-foreground/10" />
        </div>
      }
    >
      <ItemsContent />
    </Suspense>
  );
}
