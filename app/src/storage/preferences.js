// src/storage/preferences.js
// Helpers to persist user preferences like interested tags

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_INTERESTED_TAGS = 'interested_tags_v1';

export async function getInterestedTags() {
  try {
    const val = await AsyncStorage.getItem(KEY_INTERESTED_TAGS);
    if (!val) return [];
    const arr = JSON.parse(val);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function setInterestedTags(tags) {
  try {
    const unique = Array.from(new Set((Array.isArray(tags) ? tags : []).filter(Boolean)));
    await AsyncStorage.setItem(KEY_INTERESTED_TAGS, JSON.stringify(unique));
    return unique;
  } catch (e) {
    return [];
  }
}

export async function addInterestedTag(tag) {
  if (!tag) return getInterestedTags();
  const current = await getInterestedTags();
  if (current.includes(tag)) return current;
  const next = [...current, tag];
  await setInterestedTags(next);
  return next;
}

export async function removeInterestedTag(tag) {
  if (!tag) return getInterestedTags();
  const current = await getInterestedTags();
  const next = current.filter(t => t !== tag);
  await setInterestedTags(next);
  return next;
}

export async function toggleInterestedTag(tag) {
  const current = await getInterestedTags();
  if (current.includes(tag)) {
    return removeInterestedTag(tag);
  }
  return addInterestedTag(tag);
}

export default {
  getInterestedTags,
  setInterestedTags,
  addInterestedTag,
  removeInterestedTag,
  toggleInterestedTag,
};

