import { Tabs } from "expo-router";
import { LayoutDashboard, Users, DollarSign, MessageSquare, Settings } from "lucide-react-native";
import React from "react";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1B5E20',
        },
        headerStyle: {
          backgroundColor: '#1B5E20',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: "Fees",
          tabBarIcon: ({ color }) => <DollarSign color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="communication"
        options={{
          title: "Communicate",
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}