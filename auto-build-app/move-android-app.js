const fs = require('fs');
const { GetJsAppProjectDir, GetCordovaProjectDir, APK_DEBUG_PATH } = require('./_helpers');

// Имя APK — версия из package.json js-приложения (её же сверяет самообновление)
const config = JSON.parse(fs.readFileSync(GetJsAppProjectDir('package.json'), 'utf-8'));
const destinationDir = GetJsAppProjectDir('dist-apps/');
const destinationApk = destinationDir + config.version + '.apk';

function CopyAndroidApp() {
    const sourceApk = GetCordovaProjectDir(APK_DEBUG_PATH);

    if (!fs.existsSync(sourceApk)) {
        throw new Error(`APK не найден: ${sourceApk}`);
    }

    fs.mkdirSync(destinationDir, { recursive: true });
    fs.cpSync(sourceApk, destinationApk);
}

CopyAndroidApp();
console.log(`5/5) copy android app to ${destinationApk}: DONE`);
