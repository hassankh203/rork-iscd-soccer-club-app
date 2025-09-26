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
    <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
      <Icon 
        color={color} 
        size={focused ? 28 : 26} 
        strokeWidth={focused ? 2.5 : 2}
      />
      {showBadge && <View style={styles.badge} />}
    </View>
  );
}

export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1B5E20',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  focusedIconContainer: {
    backgroundColor: 'rgba(27, 94, 32, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});