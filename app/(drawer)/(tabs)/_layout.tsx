import { Tabs } from 'expo-router';
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'mainConcepts',
          tabBarIcon: () => (
            <FontAwesome name="home" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="concepts"
        options={{
          title: 'concepts',
          tabBarIcon: () => (
            <FontAwesome name="list-ul" size={24} color="black"/>
          ),
        }}
      />
      <Tabs.Screen
        name="examples"
        options={{
          title: 'examples',
          tabBarIcon: () => (
            <FontAwesome name="paste" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="definitions"
        options={{
          title: 'definitions',
          tabBarIcon: () => (
            <FontAwesome name="lightbulb-o" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="hidden"
        options={{
          href: null,
        }}
      />
      
      
    </Tabs>
  );
}
