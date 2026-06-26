import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "heroui-native";
import { CameraView } from "expo-camera";
import { useRouter } from "expo-router";

/**
 * Flow 1: Skanowanie istniejącego kodu QR
 * Flow 2: Parowanie nowego kodu (404 → CreateContainer)
 */
export default function ScanScreen() {
  const router = useRouter();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    // QR URI: shi://box/{uuid}
    // Klient wysyła GET /api/v1/containers/lookup?token={qr_token}
    // Jeśli 404 → inicjuje proces CreateContainer
    router.push({
      pathname: "/container/[id]",
      params: { id: "new", qrToken: data },
    });
  };

  return (
    <View className="flex-1">
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        className="flex-1"
      />
      {scanned && (
        <View className="absolute bottom-8 left-4 right-4">
          <Button variant="primary" onPress={() => setScanned(false)}>
            Scan Again
          </Button>
        </View>
      )}
    </View>
  );
}
