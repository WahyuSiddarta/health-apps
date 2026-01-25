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

export default i18next;
