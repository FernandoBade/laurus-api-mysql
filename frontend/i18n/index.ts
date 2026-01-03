import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import {
  normalizeResourceLanguage,
  persistResourceLanguage,
  resourceFallbackLanguage,
  resourceNamespaces,
  resolveResourceLanguage,
  type ResourceLanguage,
} from "./config";
import commonPt from "./locales/pt-BR/common.json";
import layoutPt from "./locales/pt-BR/layout.json";
import authPt from "./locales/pt-BR/auth.json";
import dashboardPt from "./locales/pt-BR/dashboard.json";
import transactionsPt from "./locales/pt-BR/transactions.json";
import accountsPt from "./locales/pt-BR/accounts.json";
import creditCardsPt from "./locales/pt-BR/creditCards.json";
import categoriesPt from "./locales/pt-BR/categories.json";
import tagsPt from "./locales/pt-BR/tags.json";
import profilePt from "./locales/pt-BR/profile.json";
import pagesPt from "./locales/pt-BR/pages.json";
import uiPt from "./locales/pt-BR/ui.json";
import formsPt from "./locales/pt-BR/forms.json";
import tablesPt from "./locales/pt-BR/tables.json";
import chartsPt from "./locales/pt-BR/charts.json";
import calendarPt from "./locales/pt-BR/calendar.json";
import commonEn from "./locales/en/common.json";
import layoutEn from "./locales/en/layout.json";
import authEn from "./locales/en/auth.json";
import dashboardEn from "./locales/en/dashboard.json";
import transactionsEn from "./locales/en/transactions.json";
import accountsEn from "./locales/en/accounts.json";
import creditCardsEn from "./locales/en/creditCards.json";
import categoriesEn from "./locales/en/categories.json";
import tagsEn from "./locales/en/tags.json";
import profileEn from "./locales/en/profile.json";
import pagesEn from "./locales/en/pages.json";
import uiEn from "./locales/en/ui.json";
import formsEn from "./locales/en/forms.json";
import tablesEn from "./locales/en/tables.json";
import chartsEn from "./locales/en/charts.json";
import calendarEn from "./locales/en/calendar.json";
import commonEs from "./locales/es/common.json";
import layoutEs from "./locales/es/layout.json";
import authEs from "./locales/es/auth.json";
import dashboardEs from "./locales/es/dashboard.json";
import transactionsEs from "./locales/es/transactions.json";
import accountsEs from "./locales/es/accounts.json";
import creditCardsEs from "./locales/es/creditCards.json";
import categoriesEs from "./locales/es/categories.json";
import tagsEs from "./locales/es/tags.json";
import profileEs from "./locales/es/profile.json";
import pagesEs from "./locales/es/pages.json";
import uiEs from "./locales/es/ui.json";
import formsEs from "./locales/es/forms.json";
import tablesEs from "./locales/es/tables.json";
import chartsEs from "./locales/es/charts.json";
import calendarEs from "./locales/es/calendar.json";

const resources = {
  "pt-BR": {
    "resource-common": commonPt,
    "resource-layout": layoutPt,
    "resource-auth": authPt,
    "resource-dashboard": dashboardPt,
    "resource-transactions": transactionsPt,
    "resource-accounts": accountsPt,
    "resource-creditCards": creditCardsPt,
    "resource-categories": categoriesPt,
    "resource-tags": tagsPt,
    "resource-profile": profilePt,
    "resource-pages": pagesPt,
    "resource-ui": uiPt,
    "resource-forms": formsPt,
    "resource-tables": tablesPt,
    "resource-charts": chartsPt,
    "resource-calendar": calendarPt,
  },
  en: {
    "resource-common": commonEn,
    "resource-layout": layoutEn,
    "resource-auth": authEn,
    "resource-dashboard": dashboardEn,
    "resource-transactions": transactionsEn,
    "resource-accounts": accountsEn,
    "resource-creditCards": creditCardsEn,
    "resource-categories": categoriesEn,
    "resource-tags": tagsEn,
    "resource-profile": profileEn,
    "resource-pages": pagesEn,
    "resource-ui": uiEn,
    "resource-forms": formsEn,
    "resource-tables": tablesEn,
    "resource-charts": chartsEn,
    "resource-calendar": calendarEn,
  },
  es: {
    "resource-common": commonEs,
    "resource-layout": layoutEs,
    "resource-auth": authEs,
    "resource-dashboard": dashboardEs,
    "resource-transactions": transactionsEs,
    "resource-accounts": accountsEs,
    "resource-creditCards": creditCardsEs,
    "resource-categories": categoriesEs,
    "resource-tags": tagsEs,
    "resource-profile": profileEs,
    "resource-pages": pagesEs,
    "resource-ui": uiEs,
    "resource-forms": formsEs,
    "resource-tables": tablesEs,
    "resource-charts": chartsEs,
    "resource-calendar": calendarEs,
  },
} as const;

export const resourceI18n = i18next.createInstance();

export const initializeResourceI18n = () => {
  if (resourceI18n.isInitialized) {
    return resourceI18n;
  }

  resourceI18n.use(initReactI18next).init({
    resources,
    ns: resourceNamespaces as unknown as string[],
    defaultNS: "resource-common",
    fallbackNS: "resource-common",
    lng: resolveResourceLanguage(),
    fallbackLng: resourceFallbackLanguage,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
    keySeparator: ".",
    react: {
      useSuspense: false,
    },
  });

  resourceI18n.on("languageChanged", (language) => {
    persistResourceLanguage(language);
  });

  return resourceI18n;
};

export const getResourceLanguage = (): ResourceLanguage => {
  return normalizeResourceLanguage(resourceI18n.language) ?? resourceFallbackLanguage;
};

export const setResourceLanguage = async (language: ResourceLanguage) => {
  await resourceI18n.changeLanguage(language);
  persistResourceLanguage(language);
};

initializeResourceI18n();

export default resourceI18n;
