import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function DrawerLayout() {
  const router = useRouter();

  return (
    <Drawer
      screenOptions={{
        headerTitle: () => null,
        headerStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 2,
          shadowOpacity: 0.08,
        },
        headerTintColor: colors.text,

        // Header Right Icons
        headerRight: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 14,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={{ marginRight: 18 }}
            >
              <Ionicons
                name="notifications-outline"
                size={23}
                color={colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/profile")}
            >
              <Ionicons
                name="person-circle-outline"
                size={30}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        ),

        //Drawer Styling
        drawerStyle: {
          backgroundColor: "#FFFFFF",
          width: 280,
        },

        drawerActiveBackgroundColor: "rgba(59,130,246,0.1)",
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: "#6B7280",

        drawerLabelStyle: {
          fontSize: 15,
          marginLeft: -10,
          fontWeight: "500",
        },

        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 10,
          marginVertical: 4,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Dashboard",
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="students"
        options={{
          title: "Students",
          drawerLabel: "Students",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="weak-topics"
        options={{
          title: "Weak Topics",
          drawerLabel: "Weak Topics",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="lesson-upload"
        options={{
          title: "Lesson Upload",
          drawerLabel: "Lesson Upload",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="reports"
        options={{
          title: "Reports",
          drawerLabel: "Reports",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerLabel: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
