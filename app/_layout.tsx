import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#07176dff",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Vision Bridge",
            headerBackVisible: false,
          }}
        />

        <Stack.Screen
          name="module"
          options={{ title: "Modules" }}
        />

        <Stack.Screen
          name="profile"
          options={{
            presentation: "modal",
            title: "Profile",
          }}
        />

        {/* Drawer group */}
        <Stack.Screen
          name="(drawer)"
          options={{ headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
