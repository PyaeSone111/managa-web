import { getItem, removeItem, setItem } from './storage';

const PROFILE_IMAGE_PREFIX = 'profile_image_';

function storageKey(userId) {
  return `${PROFILE_IMAGE_PREFIX}${userId}`;
}

export async function loadProfileImage(userId) {
  if (!userId) {
    return null;
  }
  return getItem(storageKey(userId));
}

export async function saveProfileImage(userId, imageUri) {
  if (!userId || !imageUri) {
    return;
  }
  await setItem(storageKey(userId), imageUri);
}

export async function removeProfileImage(userId) {
  if (!userId) {
    return;
  }
  await removeItem(storageKey(userId));
}
