import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import id from "./locales/id.json";

export const resources = {
  en: {
    translation: en,
  },
  id: {
    translation: id,
  },
} as const;

const deviceLanguage = getLocales()[0].languageCode ?? "id";
const availableLanguages = Object.keys(resources);
const lng = availableLanguages.includes(deviceLanguage) ? deviceLanguage : "id";

i18next.use(initReactI18next).init({
  lng,
  fallbackLng: "id",
  resources,
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export const LANGUAGE_STORAGE_KEY = "app.language";

// Restore saved language if available
(async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && availableLanguages.includes(savedLanguage)) {
      await i18next.changeLanguage(savedLanguage);
    }
  } catch (e) {
    // noop: if storage is unavailable, continue with device language
  }
})();

// Persist language changes centrally
i18next.on("languageChanged", (newLng) => {
  AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLng).catch(() => {
    // ignore storage write errors
  });
});

export default i18next;
