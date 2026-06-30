import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useProfileImage } from '../../context/ProfileImageContext';
import ProfileAvatar from '../ProfileAvatar';
import colors from '../../theme/colors';

function navigateToStackScreen(navigation, screen) {
  const parent = navigation.getParent();
  if (parent) {
    parent.navigate(screen);
    return;
  }
  navigation.navigate(screen);
}

export default function AuthHeaderButtons({ navigation }) {
  const { isAuthenticated, user } = useAuth();
  const { profileImageUri, loading: imageLoading } = useProfileImage();

  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [pressed && styles.pressed]}
          onPress={() => navigateToStackScreen(navigation, 'Profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <ProfileAvatar
            name={user?.name}
            imageUri={profileImageUri}
            size={38}
            loading={imageLoading}
            variant="header"
          />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.row]}>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        onPress={() => navigateToStackScreen(navigation, 'Login')}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
      >
        <Ionicons name="log-in-outline" size={21} color={colors.white} />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.btn, styles.signUpBtn, pressed && styles.pressed]}
        onPress={() => navigateToStackScreen(navigation, 'Register')}
        accessibilityRole="button"
        accessibilityLabel="Sign up"
      >
        <Ionicons name="person-add-outline" size={21} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  signUpBtn: {
    backgroundColor: `${colors.redOrange}CC`,
    borderColor: `${colors.redOrange}EE`,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
});
