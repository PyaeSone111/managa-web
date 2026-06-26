import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import AuthHeaderButtons from '../components/navigation/AuthHeaderButtons';
import GradientHeaderBackground from '../components/navigation/GradientHeaderBackground';
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
import ProfileScreen from '../screens/ProfileScreen';
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

function buildHeaderOptions(navigation, title, { showAuth = true } = {}) {
  return {
    title,
    headerBackground: () => <GradientHeaderBackground />,
    headerStyle: {
      backgroundColor: 'transparent',
    },
    headerTintColor: colors.white,
    headerTitleStyle: { fontWeight: '700' },
    headerShadowVisible: false,
    headerRight: showAuth
      ? () => <AuthHeaderButtons navigation={navigation} />
      : undefined,
  };
}

const stackScreenOptions = {
  headerBackground: () => <GradientHeaderBackground />,
  headerStyle: {
    backgroundColor: 'transparent',
  },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.almond },
};

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Browse: { focused: 'search', unfocused: 'search-outline' },
  Rankings: { focused: 'trophy', unfocused: 'trophy-outline' },
  Favorites: { focused: 'heart', unfocused: 'heart-outline' },
};

function tabBarIcon(routeName) {
  return ({ focused, color, size }) => {
    const icons = TAB_ICONS[routeName];
    const name = focused ? icons.focused : icons.unfocused;
    return <Ionicons name={name} size={size} color={color} />;
  };
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.redOrange,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.almondBorder,
          borderTopWidth: 1,
          height: 52 + insets.bottom,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarButton: (props) => (
          <PlatformPressable
            {...props}
            style={[props.style, styles.tabBarButton]}
          />
        ),
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 0,
          marginBottom: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          ...buildHeaderOptions(navigation, 'Myangar'),
          tabBarIcon: tabBarIcon('Home'),
        })}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={({ navigation }) => ({
          ...buildHeaderOptions(navigation, 'Browse'),
          tabBarIcon: tabBarIcon('Browse'),
        })}
      />
      <Tab.Screen
        name="Rankings"
        component={RankingsScreen}
        options={({ navigation }) => ({
          ...buildHeaderOptions(navigation, 'Rankings'),
          tabBarIcon: tabBarIcon('Rankings'),
        })}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={({ navigation }) => ({
          ...buildHeaderOptions(navigation, 'Favorites'),
          tabBarIcon: tabBarIcon('Favorites'),
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SeriesDetail"
          component={SeriesDetailScreen}
          options={({ navigation, route }) => ({
            ...buildHeaderOptions(navigation, route.params?.title || 'Series'),
          })}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={({ navigation, route }) => ({
            ...buildHeaderOptions(navigation, route.params?.title || 'Reader'),
          })}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={({ navigation }) => ({
            ...buildHeaderOptions(navigation, 'Sign In', { showAuth: false }),
            presentation: 'modal',
          })}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={({ navigation }) => ({
            ...buildHeaderOptions(navigation, 'Register', { showAuth: false }),
            presentation: 'modal',
          })}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation }) => ({
            ...buildHeaderOptions(navigation, 'Profile', { showAuth: false }),
          })}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={({ navigation }) => buildHeaderOptions(navigation, 'Privacy Policy')}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUsScreen}
          options={({ navigation }) => buildHeaderOptions(navigation, 'Contact Us')}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
