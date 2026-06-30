import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from './AuthContext';
import {
  loadProfileImage,
  removeProfileImage,
  saveProfileImage,
} from '../services/profileImageStorage';

const ProfileImageContext = createContext(null);

export function useProfileImage() {
  const context = useContext(ProfileImageContext);
  if (!context) {
    throw new Error('useProfileImage must be used within ProfileImageProvider');
  }
  return context;
}

export function ProfileImageProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const userKey = user?.id ?? user?.email ?? null;

  useEffect(() => {
    let active = true;

    if (!isAuthenticated || !userKey) {
      setProfileImageUri(null);
      return undefined;
    }

    loadProfileImage(userKey).then((uri) => {
      if (active) {
        setProfileImageUri(uri);
      }
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated, userKey]);

  const pickProfileImage = useCallback(async () => {
    if (!userKey) {
      return;
    }

    setLoading(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.8,
      });

      if (result.didCancel || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      let uri = asset.uri;

      if (asset.base64) {
        const mime = asset.type || 'image/jpeg';
        uri = `data:${mime};base64,${asset.base64}`;
      }

      if (!uri) {
        return;
      }

      await saveProfileImage(userKey, uri);
      setProfileImageUri(uri);
    } finally {
      setLoading(false);
    }
  }, [userKey]);

  const clearProfileImage = useCallback(async () => {
    if (!userKey) {
      return;
    }

    await removeProfileImage(userKey);
    setProfileImageUri(null);
  }, [userKey]);

  const showProfileImageOptions = useCallback(() => {
    const options = profileImageUri
      ? [
          { text: 'Change Photo', onPress: pickProfileImage },
          {
            text: 'Remove Photo',
            style: 'destructive',
            onPress: clearProfileImage,
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      : [
          { text: 'Choose Photo', onPress: pickProfileImage },
          { text: 'Cancel', style: 'cancel' },
        ];

    Alert.alert('Profile Photo', undefined, options);
  }, [profileImageUri, pickProfileImage, clearProfileImage]);

  const value = useMemo(
    () => ({
      profileImageUri,
      loading,
      pickProfileImage,
      clearProfileImage,
      showProfileImageOptions,
    }),
    [profileImageUri, loading, pickProfileImage, clearProfileImage, showProfileImageOptions],
  );

  return (
    <ProfileImageContext.Provider value={value}>{children}</ProfileImageContext.Provider>
  );
}
