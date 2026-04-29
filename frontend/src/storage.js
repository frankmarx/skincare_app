// Unified storage: uses Capacitor Preferences on native device, localStorage in browser

let _preferences = null;

async function getPreferences() {
  if (_preferences) return _preferences;
  try {
    const { Preferences } = await import('@capacitor/preferences');
    _preferences = Preferences;
    return _preferences;
  } catch {
    return null;
  }
}

export async function storageGet(key) {
  try {
    const prefs = await getPreferences();
    if (prefs) {
      const { value } = await prefs.get({ key });
      return value;
    }
  } catch {}
  return localStorage.getItem(key);
}

export async function storageSet(key, value) {
  try {
    const prefs = await getPreferences();
    if (prefs) {
      await prefs.set({ key, value });
      return;
    }
  } catch {}
  localStorage.setItem(key, value);
}

export async function storageDelete(key) {
  try {
    const prefs = await getPreferences();
    if (prefs) {
      await prefs.remove({ key });
      return;
    }
  } catch {}
  localStorage.removeItem(key);
}
