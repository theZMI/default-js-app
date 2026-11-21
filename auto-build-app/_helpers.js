const fs = require('fs');
const path = require('path');

// Корень js-приложения — от расположения скриптов, а не от текущей папки:
// скрипты работают, даже если их запустили не из корня проекта.
const JS_APP_ROOT = path.resolve(__dirname, '..');
// Cordova-проект лежит рядом и называется так же, но с суффиксом -cordova
const CORDOVA_ROOT = JS_APP_ROOT + '-cordova';

exports.GetJsAppProjectDir = (append = '') => path.join(JS_APP_ROOT, append);

exports.GetCordovaProjectDir = (append = '') => path.join(CORDOVA_ROOT, append);

exports.APK_DEBUG_PATH = 'platforms/android/app/build/outputs/apk/debug/app-debug.apk';
exports.APK_RELEASE_PATH = 'platforms/android/app/build/outputs/apk/release/app-release.apk';
exports.AAB_RELEASE_PATH = 'platforms/android/app/build/outputs/bundle/release/app-release.aab';

exports.GetAppVersion = () => JSON.parse(fs.readFileSync(path.join(JS_APP_ROOT, 'package.json'), 'utf-8')).version;

// Понятная ошибка вместо ENOENT посреди сборки
exports.AssertCordovaProject = () => {
    if (!fs.existsSync(path.join(CORDOVA_ROOT, 'config.xml'))) {
        console.error(`Не найден cordova-проект: ${CORDOVA_ROOT}\n` +
            `Создайте его рядом (папка с тем же именем + "-cordova"), см. README.md.`);
        process.exit(1);
    }
};

exports.AssertDist = () => {
    if (!fs.existsSync(path.join(JS_APP_ROOT, 'dist/index.html'))) {
        console.error('Нет dist/index.html — сначала соберите приложение (npm run build).');
        process.exit(1);
    }
};
