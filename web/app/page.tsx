"use client";

import { Card, TextField, Button } from "@heroui/react";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Smart Home Inventory</h1>
        <p className="text-foreground/60">Your home, organized.</p>
      </div>

      {/* Search bar */}
      <div className="mb-8 flex gap-3">
        <TextField
          className="flex-1"
          label="Search"
          description="Search items by name, description, or tag..."
          aria-label="Search items"
        />
        <Button variant="primary">Search</Button>
      </div>

      {/* Stats cards — HeroUI v3 compound pattern */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <Card>
          <Card.Header>
            <Card.Title>Containers</Card.Title>
          </Card.Header>
          <Card.Body>
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-foreground/60">active boxes</p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Items</Card.Title>
          </Card.Header>
          <Card.Body>
            <p className="text-3xl font-bold">247</p>
            <p className="text-sm text-foreground/60">tracked items</p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Locations</Card.Title>
          </Card.Header>
          <Card.Body>
            <p className="text-3xl font-bold">5</p>
            <p className="text-sm text-foreground/60">zones</p>
          </Card.Body>
        </Card>
      </div>

      {/* Recent items */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Items</Card.Title>
          <Card.Description>Last 10 items added</Card.Description>
        </Card.Header>
        <Card.Body>{/* Item list here */}</Card.Body>
      </Card>
    </div>
  );
}
