import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import BalancesScreen from '../screens/BalancesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ emoji, label, focused, color }: any) => (
  <View style={{ alignItems: 'center', gap: 2 }}>
    <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
    <Text style={{ fontSize: 10, color, fontWeight: focused ? '700' : '400' }}>{label}</Text>
  </View>
);

const MainTabs = ({ onLogout }: { onLogout: () => void }) => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} color={color} />
          ),
        }}>
        {(props) => <HomeScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Balances"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📊" label="Balances" focused={focused} color={color} />
          ),
        }}>
        {(props) => <BalancesScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} color={color} />
          ),
        }}>
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

interface Props {
  onLogout: () => void;
}

const AppNavigator: React.FC<Props> = ({ onLogout }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="MainTabs">
          {() => <MainTabs onLogout={onLogout} />}
        </Stack.Screen>
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
