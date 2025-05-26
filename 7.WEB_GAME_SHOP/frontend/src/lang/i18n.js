import i18n from "i18next";
import translationEn from "./translation.en.json";
import translationKo from "./translation.ko.json";
import LanguageDetector from "i18next-browser-languagedetector";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ko from 'javascript-time-ago/locale/ko'


TimeAgo.addLocale(en)
TimeAgo.addDefaultLocale(ko)
global.time_ago = new TimeAgo()

const resources = {
  en: {
    translation: translationEn
  },
  ko: {
    translation: translationKo
  }
};

i18n.use(LanguageDetector).init({
  resources,
  lng: "ko",
  fallbackLng: ["en", "ko"],
  keySeparator: false, // we do not use keys in form messages.welcome
  interpolation: {
    escapeValue: false // react already safes from xss
  },
  returnObjects: true
});

export default i18n;