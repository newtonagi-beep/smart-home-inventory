import { useState } from "react";
import { View, Text } from "react-native";
import { Card, Button, TextField } from "heroui-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const API = "http://192.168.0.65:8000/api/v1";

export default function ContainerScreen() {
  const { id, qrToken: rawToken } = useLocalSearchParams<{ id: string; qrToken?: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API}/locations`);
      const locations = await res.json();

      if (!Array.isArray(locations) || locations.length === 0) {
        setError("No locations exist. Create one first on the web dashboard.");
        return;
      }

      const createRes = await fetch(`${API}/containers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          qr_token: rawToken || crypto.randomUUID(),
          location_id: locations[0].id,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        setError(err.detail || "Failed to create container");
        return;
      }

      setDone(true);
    } catch {
      setError("Connection error. Check network.");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-4 text-4xl">✅</Text>
        <Text className="mb-2 text-xl font-bold">Container Created!</Text>
        <Text className="mb-6 text-foreground/60">{name}</Text>
        <Button variant="primary" onPress={() => router.replace("/")}>
          Back to Home
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4 pt-12">
      {isNew ? (
        <>
          <Text className="mb-6 text-2xl font-bold">New Container</Text>
          <Text className="mb-4 text-foreground/60">
            Pair this QR code with a new container.
          </Text>

          <Card className="mb-6">
            <Card.Body>
              <View className="mb-4">
                <TextField
                  label="Name"
                  placeholder="e.g. Spice Rack"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View className="mb-4">
                <TextField
                  label="Description"
                  placeholder="Optional"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {error ? (
                <Text className="mb-2 text-sm text-red-500">{error}</Text>
              ) : null}

              <Button
                variant="primary"
                isDisabled={!name.trim() || saving}
                onPress={handleCreate}
              >
                {saving ? "Creating..." : "Create Container"}
              </Button>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Text>Container ID: {id}</Text>
      )}
    </View>
  );
}
