import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import BalancesScreen from '../screens/BalancesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ iconName, activeIconName, label, focused, color }: any) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 72 }}>
    <Ionicons
      name={focused ? activeIconName : iconName}
      size={focused ? 22 : 20}
      color={color}
    />
    <Text
      numberOfLines={1}
      ellipsizeMode="clip"
      style={{ fontSize: 11, color, fontWeight: focused ? '700' : '500', letterSpacing: 0.2, textAlign: 'center' }}>
      {label}
    </Text>
  </View>
);

const MainTabs = ({ onLogout }: { onLogout: () => void }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 45 + insets.bottom,
          paddingBottom: Math.max(10, insets.bottom),
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              iconName="home-outline"
              activeIconName="home"
              label="Home"
              focused={focused}
              color={color}
            />
          ),
        }}>
        {(props) => <HomeScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Balances"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              iconName="wallet-outline"
              activeIconName="wallet"
              label="Balances"
              focused={focused}
              color={color}
            />
          ),
        }}>
        {(props) => <BalancesScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              iconName="person-outline"
              activeIconName="person"
              label="Profile"
              focused={focused}
              color={color}
            />
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
