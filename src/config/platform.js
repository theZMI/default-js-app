// Платформа — то, ПОД ЧТО собрано приложение, а не что определилось в рантайме.
// Значение берётся из переменной сборки VUE_APP_PLATFORM (её задают цели
// build-web / build-android / build-ios в Makefile), а если её нет — из
// EnvConfig.PLATFORM в src/envs/*.js. Так все версии собираются из одного
// env-конфига, без ручной правки перед каждой сборкой. Мусорное значение
// переменной игнорируется — откатываемся на конфиг.
import Env from '@/env';

const PLATFORM_OVERRIDE = process.env.VUE_APP_PLATFORM;
const KNOWN_PLATFORMS = ['web', 'android', 'ios'];

export const PLATFORM = KNOWN_PLATFORMS.includes(PLATFORM_OVERRIDE) ? PLATFORM_OVERRIDE : Env.PLATFORM;
export const isWeb = PLATFORM === 'web';
export const isAndroid = PLATFORM === 'android';
export const isIos = PLATFORM === 'ios';
// Собрано под Cordova (android/ios) — в отличие от рантайм-проверки window.cordova,
// которая в dev-браузере всегда ложна
export const isNativeBuild = isAndroid || isIos;
