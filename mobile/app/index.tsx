import { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, TouchableOpacity } from "react-native";
import { Card, Button } from "heroui-native";
import { useRouter } from "expo-router";

const API = "http://192.168.0.65:8000/api/v1";

interface Container {
  id: string;
  name: string;
  qr_token: string;
  location_id: string;
}

interface Item {
  id: string;
  name: string;
  description?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [containers, setContainers] = useState<Container[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contRes, itemsRes] = await Promise.all([
        fetch(`${API}/containers`),
        fetch(`${API}/items/search?q=`),
      ]);
      const contData = await contRes.json();
      const itemsData = await itemsRes.json();
      setContainers(Array.isArray(contData) ? contData : []);
      setItems(Array.isArray(itemsData) ? itemsData.map((i: any) => ({ id: i.item_id, name: i.name, description: i.description })) : []);
    } catch {
      // offline
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-bold">Smart Home Inventory</Text>
        <Text className="text-foreground/60">Your home, organized.</Text>
      </View>

      {/* Scan QR - główna akcja */}
      <Button
        variant="primary"
        className="mb-6"
        onPress={() => router.push("/scan")}
      >
        Scan QR Code
      </Button>

      {/* Stats */}
      <View className="mb-6 flex-row gap-4">
        <Card className="flex-1">
          <Card.Header>
            <Card.Title>Containers</Card.Title>
          </Card.Header>
          <Card.Body>
            <Text className="text-2xl font-bold">{loading ? "..." : containers.length}</Text>
            <Text className="text-foreground/60">active boxes</Text>
          </Card.Body>
        </Card>

        <Card className="flex-1">
          <Card.Header>
            <Card.Title>Items</Card.Title>
          </Card.Header>
          <Card.Body>
            <Text className="text-2xl font-bold">{loading ? "..." : items.length}</Text>
            <Text className="text-foreground/60">tracked items</Text>
          </Card.Body>
        </Card>
      </View>

      {/* Recent items */}
      <Text className="mb-3 text-lg font-semibold">Recent Items</Text>
      {items.length === 0 ? (
        <Card>
          <Card.Body>
            <Text className="text-center text-foreground/40">
              No items yet. Scan a QR code to get started!
            </Text>
          </Card.Body>
        </Card>
      ) : (
        <FlatList
          data={items.slice(0, 10)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="mb-2 rounded-lg bg-foreground/5 p-3"
              onPress={() => router.push({ pathname: "/container/[id]", params: { id: item.id } })}
            >
              <Text className="font-medium">{item.name}</Text>
              {item.description && (
                <Text className="text-sm text-foreground/50">{item.description}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
