import { View } from "react-native";
import { Card, Button, TextField } from "heroui-native";
import { useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";

export default function HomeScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  return (
    <View className="flex-1 bg-background p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-bold">Inventory</Text>
        <Text className="text-foreground/60">Your home, organized.</Text>
      </View>

      {/* Scan QR button — HeroUI Native variant="primary", onPress */}
      <Button
        variant="primary"
        onPress={() => {
          if (!permission?.granted) {
            requestPermission();
          }
          router.push("/scan");
        }}
        className="mb-6"
      >
        Scan QR Code
      </Button>

      {/* Search */}
      <TextField
        placeholder="Search items..."
        className="mb-6"
      />

      {/* Stats cards — HeroUI Native compound pattern */}
      <Card className="mb-4">
        <Card.Header>
          <Card.Title>Containers</Card.Title>
        </Card.Header>
        <Card.Body>
          <View className="flex-row justify-between">
            <Text className="text-2xl font-bold">12</Text>
            <Text className="text-foreground/60">active</Text>
          </View>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title>Items</Card.Title>
        </Card.Header>
        <Card.Body>
          <View className="flex-row justify-between">
            <Text className="text-2xl font-bold">247</Text>
            <Text className="text-foreground/60">tracked</Text>
          </View>
        </Card.Body>
      </Card>
    </View>
  );
}
