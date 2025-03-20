import { createI18n } from 'vue-i18n';
import en from './locales/en.js';
import ru from './locales/ru.js';
import lv from './locales/lv.js';

// Получаем сохраненный язык из localStorage или используем язык браузера
const getBrowserLanguage = () => {
    const browserLang = navigator.language.split('-')[0]; // Получаем основной код языка (en, ru, lv)
    return ['en', 'ru', 'lv'].includes(browserLang) ? browserLang : 'en'; // Проверяем, поддерживается ли язык
};

const savedLanguage = localStorage.getItem('language') || getBrowserLanguage();

const i18n = createI18n({
    legacy: false, // Используем Composition API
    locale: savedLanguage,
    fallbackLocale: 'en',
    messages: {
        en,
        ru,
        lv
    }
});

export default i18n;