import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import AuthHeaderButtons from '../components/navigation/AuthHeaderButtons';
import GradientHeaderBackground from '../components/navigation/GradientHeaderBackground';
import HeaderBrandLogo, { HEADER_HORIZONTAL_PADDING } from '../components/navigation/HeaderBrandLogo';
// import BottomAdBanner from '../components/ads/BottomAdBanner';
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import RecentScreen from '../screens/RecentScreen';
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

function buildHeaderOptions(navigation, subtitle, { showAuth = true, showBack = false } = {}) {
  return {
    title: '',
    headerTitle: '',
    headerLeft: () => (
      <View style={styles.headerLeftRow}>
        {showBack ? (
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </Pressable>
        ) : null}
        <HeaderBrandLogo subtitle={subtitle} />
      </View>
    ),
    headerLeftContainerStyle: styles.headerLeftContainer,
    headerBackground: () => <GradientHeaderBackground />,
    headerStyle: {
      backgroundColor: 'transparent',
      minHeight: 56,
    },
    headerTintColor: colors.white,
    headerShadowVisible: false,
    headerBackVisible: false,
    headerRight: showAuth
      ? () => <AuthHeaderButtons navigation={navigation} />
      : undefined,
    headerRightContainerStyle: styles.headerSide,
  };
}

const stackScreenOptions = {
  headerBackground: () => <GradientHeaderBackground />,
  headerStyle: {
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  headerTintColor: colors.white,
  headerShadowVisible: false,
  headerBackVisible: false,
  contentStyle: { backgroundColor: colors.almond },
};

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Browse: { focused: 'search', unfocused: 'search-outline' },
  Recent: { focused: 'time', unfocused: 'time-outline' },
  Rankings: { focused: 'trophy', unfocused: 'trophy-outline' },
  Favorites: { focused: 'heart', unfocused: 'heart-outline' },
};

const TAB_LABELS = {
  Home: 'Home',
  Browse: 'Browse',
  Recent: 'Recent',
  Rankings: 'Rankings',
  Favorites: 'Favorites',
};

function ThemeTabUnderline() {
  return (
    <View style={styles.themeUnderline}>
      <View style={[styles.themeSeg, styles.segNavy]} />
      <View style={[styles.themeSeg, styles.segMango]} />
      <View style={[styles.themeSeg, styles.segOrange]} />
    </View>
  );
}

function tabBarIcon(routeName) {
  return ({ focused, color, size }) => {
    const icons = TAB_ICONS[routeName];
    const name = focused ? icons.focused : icons.unfocused;
    return <Ionicons name={name} size={size} color={color} />;
  };
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <TabBarWithAd {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          ...buildHeaderOptions(navigation, 'Home'),
          tabBarIcon: tabBarIcon('Home'),
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
        name="Browse"
        component={BrowseScreen}
        options={({ navigation }) => ({
          ...buildHeaderOptions(navigation, 'Browse'),
          tabBarIcon: tabBarIcon('Browse'),
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
      <Tab.Screen
        name="Recent"
        component={RecentScreen}
        options={({ navigation }) => ({
          ...buildHeaderOptions(navigation, 'Recent'),
          tabBarIcon: tabBarIcon('Recent'),
        })}
      />
    </Tab.Navigator>
  );
}

function TabBarWithAd({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View>
      {/* <BottomAdBanner /> */}
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, 6),
            height: 58 + Math.max(insets.bottom, 6),
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel ??
            TAB_LABELS[route.name] ??
            options.title ??
            route.name;
          const tint = focused ? colors.redOrange : colors.muted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const icon = options.tabBarIcon?.({
            focused,
            color: tint,
            size: 22,
          });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? String(label)}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.tabItem, pressed && styles.tabItemPressed]}
            >
              {icon}
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </Text>
              {focused ? <ThemeTabUnderline /> : <View style={styles.themeUnderlineSpacer} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    paddingLeft: HEADER_HORIZONTAL_PADDING,
    paddingBottom: 4,
    gap: 2,
  },
  headerLeftContainer: {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: '72%',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    marginBottom: 2,
  },
  backBtnPressed: {
    opacity: 0.75,
  },
  headerSide: {
    minWidth: 48,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.almondBorder,
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    gap: 2,
  },
  tabItemPressed: {
    opacity: 0.78,
  },
  themeUnderline: {
    flexDirection: 'row',
    height: 3,
    width: '72%',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 3,
  },
  themeUnderlineSpacer: {
    height: 3,
    marginTop: 3,
  },
  themeSeg: {
    flex: 1,
  },
  segNavy: {
    backgroundColor: colors.navy,
  },
  segMango: {
    backgroundColor: colors.mango,
  },
  segOrange: {
    backgroundColor: colors.redOrange,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.redOrange,
    fontWeight: '700',
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
            ...buildHeaderOptions(navigation, route.params?.title || 'Series', { showBack: true }),
          })}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={({ navigation, route }) => ({
            ...buildHeaderOptions(navigation, route.params?.title || 'Reader', { showBack: true }),
          })}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={({ navigation }) => ({
            ...buildHeaderOptions(navigation, 'Sign In', { showAuth: false, showBack: true }),
            presentation: 'modal',
          })}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={({ navigation }) => ({
            ...buildHeaderOptions(navigation, 'Register', { showAuth: false, showBack: true }),
            presentation: 'modal',
          })}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation }) => ({
            ...buildHeaderOptions(navigation, 'Profile', { showAuth: false, showBack: true }),
          })}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={({ navigation }) =>
            buildHeaderOptions(navigation, 'Privacy Policy', { showBack: true })
          }
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUsScreen}
          options={({ navigation }) =>
            buildHeaderOptions(navigation, 'Contact Us', { showBack: true })
          }
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
