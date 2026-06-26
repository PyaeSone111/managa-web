import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import RankingsScreen from '../screens/RankingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SeriesDetailScreen from '../screens/SeriesDetailScreen';
import ReaderScreen from '../screens/ReaderScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import LoadingSpinner from '../components/LoadingSpinner';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.almond,
    primary: colors.redOrange,
    text: colors.navy,
    card: colors.white,
    border: colors.almondBorder,
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: colors.almond },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...screenOptions,
        tabBarActiveTintColor: colors.redOrange,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.almondBorder,
        },
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Myangar' }} />
      <Tab.Screen name="Browse" component={BrowseScreen} options={{ title: 'Browse' }} />
      <Tab.Screen name="Rankings" component={RankingsScreen} options={{ title: 'Rankings' }} />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={({ navigation }) => ({
            headerShown: false,
          })}
        />
        <Stack.Screen
          name="SeriesDetail"
          component={SeriesDetailScreen}
          options={({ route }) => ({ title: route.params?.title || 'Series' })}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={({ route }) => ({
            title: route.params?.title || 'Reader',
          })}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Sign In', presentation: 'modal' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Register', presentation: 'modal' }}
        />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} options={{ title: 'Contact Us' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
