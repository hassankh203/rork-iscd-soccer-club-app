import { Tabs } from "expo-router";
import { LayoutDashboard, Users, DollarSign, MessageSquare, Settings } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useApp } from "@/hooks/app-context";

function TabBarIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  const { messages } = useApp();
  const Icon = name;
  
  // For admin, show badge if there are unread messages TO admin
  const showBadge = name === MessageSquare && 
    messages.some(m => m.toUserId === 'admin' && !m.read);
  
  return (
    <View style={styles.iconContainer}>
      <Icon color={color} size={24} />
      {showBadge && <View style={styles.badge} />}
    </View>
  );
}

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
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={LayoutDashboard} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={Users} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: "Fees",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={DollarSign} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="communication"
        options={{
          title: "Communicate",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={MessageSquare} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={Settings} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
});