import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HeroUINativeProvider } from "heroui-native";
import { Stack } from "expo-router";
import "./global.css";

/**
 * HeroUI Native — GestureHandlerRootView + HeroUINativeProvider required.
 * Uniwind (Tailwind CSS for React Native) — hsl colors.
 * Compound components: Card.Header, Card.Body (not Card.Content).
 * Event handlers: onPress (not onClick).
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{ title: "Smart Home Inventory" }}
          />
          <Stack.Screen
            name="scan"
            options={{ title: "Scan QR", presentation: "modal" }}
          />
          <Stack.Screen
            name="container/[id]"
            options={{ title: "Container" }}
          />
        </Stack>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
