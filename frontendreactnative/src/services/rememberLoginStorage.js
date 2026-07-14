import { REMEMBER_LOGIN_KEY } from '../utils/constants';
import { getJson, removeItem, setJson } from './storage';

export async function getRememberedLogin() {
  const data = await getJson(REMEMBER_LOGIN_KEY);
  if (!data?.remember) return null;
  return {
    email: data.email || '',
    password: data.password || '',
  };
}

export async function saveRememberedLogin({ email, password }) {
  await setJson(REMEMBER_LOGIN_KEY, {
    email: email.trim(),
    password,
    remember: true,
  });
}

export async function clearRememberedLogin() {
  await removeItem(REMEMBER_LOGIN_KEY);
}
