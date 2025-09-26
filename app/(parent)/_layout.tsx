import { Tabs } from "expo-router";
import { Home, Users, DollarSign, MessageSquare, User } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useApp } from "@/hooks/app-context";

function TabBarIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  const { unreadCounts } = useApp();
  const Icon = name;
  
  const showBadge = name === MessageSquare && 
    (unreadCounts.messages > 0 || unreadCounts.announcements > 0 || unreadCounts.polls > 0);
  
  return (
    <View style={styles.iconContainer}>
      <Icon color={color} size={24} />
      {showBadge && <View style={styles.badge} />}
    </View>
  );
}

export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1B5E20',
        tabBarInactiveTintColor: '#666',
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
            <TabBarIcon name={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="kids"
        options={{
          title: "My Kids",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={Users} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={DollarSign} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="communication"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={MessageSquare} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={User} color={color} focused={focused} />
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