// Реестр примеров: каждый — отдельное мини-приложение на одну возможность устройства.
// Из этого списка строятся и плитки на странице /examples, и маршруты /examples/<path>.
//   feature — показывать, только если включена FEATURES[feature] (src/config/features.js)
//   link    — вместо своей страницы ведёт на существующий маршрут
// Чтобы взять пример за основу своей страницы — скопируйте его .vue и уберите <example-layout>.
import {FEATURES} from '@/config/features';

const EXAMPLES = [
    {path: 'compass', name: 'Компас', icon: 'bi-compass', desc: 'Стрелка на север, градусы и сторона света', feature: 'compass',
        component: () => import('./ExampleCompass.vue')},
    {path: 'gps', name: 'GPS-трекер', icon: 'bi-geo-alt', desc: 'Координаты, скорость, пройденный путь и трек', feature: 'geolocation',
        component: () => import('./ExampleGps.vue')},
    {path: 'scanner', name: 'Сканер кодов', icon: 'bi-qr-code-scan', desc: 'QR и штрихкоды с историей сканирований', feature: 'scanner',
        component: () => import('./ExampleScanner.vue')},
    {path: 'camera', name: 'Камера', icon: 'bi-camera', desc: 'Фото с камеры и из галереи, своя галерея в приложении', feature: 'camera',
        component: () => import('./ExampleCamera.vue')},
    {path: 'microphone', name: 'Диктофон', icon: 'bi-mic', desc: 'Запись с микрофона, уровень громкости, прослушивание', feature: 'microphone',
        component: () => import('./ExampleMicrophone.vue')},
    {path: 'vibration', name: 'Вибрация', icon: 'bi-phone-vibrate', desc: 'Готовые паттерны, SOS и «держи, чтобы вибрировать»', feature: 'vibration',
        component: () => import('./ExampleVibration.vue')},
    {path: 'level', name: 'Уровень', icon: 'bi-bullseye', desc: 'Пузырьковый уровень по наклону и счётчик встряхиваний', feature: 'motion',
        component: () => import('./ExampleLevel.vue')},
    {path: 'background', name: 'Фоновый режим', icon: 'bi-layers', desc: 'Таймер, который тикает в свёрнутом приложении', feature: 'backgroundMode',
        component: () => import('./ExampleBackground.vue')},
    {path: 'files', name: 'Файлы', icon: 'bi-file-earmark-arrow-down', desc: 'Скачивание с прогрессом и открытие системой', feature: 'files',
        component: () => import('./ExampleFiles.vue')},
    {path: 'storage', name: 'Хранилище', icon: 'bi-database', desc: 'Заметки в IndexedDB — переживают перезапуск',
        component: () => import('./ExampleStorage.vue')},
    {path: 'device', name: 'Устройство и сеть', icon: 'bi-cpu', desc: 'Модель, ОС, батарея, тип и состояние сети', feature: 'deviceInfo',
        component: () => import('./ExampleDevice.vue')},
    {path: 'audio-output', name: 'Аудиовыходы', icon: 'bi-speaker', desc: 'Динамик, наушники, Bluetooth + тестовый звук', feature: 'audioOutput',
        component: () => import('./ExampleAudioOutput.vue')},
    {path: 'links', name: 'Ссылки', icon: 'bi-box-arrow-up-right', desc: 'Браузер, звонок, почта, карты, браузер внутри приложения', feature: 'externalLinks',
        component: () => import('./ExampleLinks.vue')},
    {path: 'updates', name: 'Обновление', icon: 'bi-cloud-arrow-down', desc: 'Проверка, скачивание и установка нового APK', feature: 'appUpdates',
        link: '/check-updates'},
];

export const examples = EXAMPLES.filter((e) => !e.feature || FEATURES[e.feature]);

export const exampleRoutes = examples
    .filter((e) => e.component)
    .map((e) => ({path: `/examples/${e.path}`, name: `example-${e.path}`, component: e.component, meta: {example: e}}));
