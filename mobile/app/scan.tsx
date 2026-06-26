import { useState, useEffect } from "react";
import { View, Text, Alert, FlatList, StyleSheet } from "react-native";
import { Button } from "heroui-native";
import { CameraView, Camera } from "expo-camera";
import { useRouter } from "expo-router";

const API = "http://192.168.0.65:8000/api/v1";

interface ContainerData {
  container: { id: string; name: string; qr_token: string };
  items: Array<{ id: string; name: string; description?: string }>;
}

export default function ScanScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [containerData, setContainerData] = useState<ContainerData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    // Walidacja formatu QR
    if (!data.startsWith("shi://box/")) {
      Alert.alert("Error", "Unrecognized QR code format.");
      setScanned(false);
      return;
    }

    const qrToken = data.split("shi://box/")[1];
    if (!qrToken) {
      Alert.alert("Error", "Invalid QR code.");
      setScanned(false);
      return;
    }

    try {
      const response = await fetch(`${API}/containers/lookup?token=${qrToken}`);

      if (response.status === 404) {
        // Flow 2: Nowy kod QR — inicjacja procesu parowania
        Alert.alert(
          "New Container!",
          "This QR code is empty. Would you like to assign it to a new container?",
          [
            { text: "Cancel", style: "cancel", onPress: () => setScanned(false) },
            {
              text: "Create",
              onPress: () =>
                router.push({
                  pathname: "/container/[id]",
                  params: { id: "new", qrToken },
                }),
            },
          ]
        );
      } else if (response.ok) {
        // Flow 1: Wyświetl zawartość kontenera
        const result: ContainerData = await response.json();
        setContainerData(result);
      } else {
        throw new Error("Server error");
      }
    } catch (e: any) {
      setError(e.message || "Connection error. Check network access.");
      // Future: offline mode with SQLite
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-4 text-lg">Camera access is required to scan QR codes.</Text>
        <Button variant="primary" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  // Flow 1: Pokazanie zawartości po zeskanowaniu
  if (containerData) {
    return (
      <View className="flex-1 bg-white p-4 pt-12">
        <Text className="mb-2 text-2xl font-bold">
          📦 {containerData.container.name}
        </Text>
        <Text className="mb-6 text-foreground/60">
          QR: {containerData.container.qr_token.slice(0, 20)}...
        </Text>

        <Text className="mb-3 text-lg font-semibold">Items</Text>
        {containerData.items.length === 0 ? (
          <Text className="text-foreground/40">This container is empty.</Text>
        ) : (
          <FlatList
            data={containerData.items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mb-2 rounded-lg bg-foreground/5 p-3">
                <Text className="font-medium">{item.name}</Text>
                {item.description && (
                  <Text className="text-sm text-foreground/50">{item.description}</Text>
                )}
              </View>
            )}
          />
        )}

        <View className="mt-6">
          <Button
            variant="primary"
            onPress={() => {
              setContainerData(null);
              setScanned(false);
            }}
          >
            Scan Another
          </Button>
        </View>
      </View>
    );
  }

  // Ekran skanowania QR
  return (
    <View className="flex-1">
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        className="flex-1"
      />

      {error ? (
        <View className="absolute bottom-24 left-4 right-4 rounded-lg bg-red-100 p-3">
          <Text className="text-center text-red-700">{error}</Text>
        </View>
      ) : null}

      {scanned && !containerData && (
        <View className="absolute bottom-8 left-4 right-4">
          <Button variant="primary" onPress={() => setScanned(false)}>
            Scan Again
          </Button>
        </View>
      )}

      {!scanned && (
        <View className="absolute bottom-8 left-4 right-4">
          <Button variant="secondary" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>
      )}
    </View>
  );
}
