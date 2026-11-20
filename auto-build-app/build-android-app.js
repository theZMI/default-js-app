const fs = require('fs');
const { execSync } = require('child_process');
const { GetCordovaProjectDir, AssertCordovaProject, APK_DEBUG_PATH } = require('./_helpers');

AssertCordovaProject();

const oldApkFile = GetCordovaProjectDir(APK_DEBUG_PATH);
if (fs.existsSync(oldApkFile)) {
    fs.unlinkSync(oldApkFile);
    console.log('3/5) remove old app-debug into cordova-project directory: DONE');
} else {
    console.log('3/5) no found old app-debug: DONE');
}

// Свежий клон cordova-проекта: platforms/ и plugins/ не в git. `cordova prepare` ставит
// платформу и все плагины по списку из его package.json (сам `cordova build` этого не делает).
if (!fs.existsSync(GetCordovaProjectDir('platforms/android'))) {
    console.log('3/5) android platform not found — cordova prepare android...');
    execSync('cordova prepare android', {
        cwd: GetCordovaProjectDir(),
        stdio: 'inherit',
    });
}

// Синхронно и с выводом в консоль: раньше сборка шла через асинхронный exec без вывода —
// ошибки gradle терялись, а следующий шаг копировал несуществующий APK.
execSync('cordova build android', {
    cwd: GetCordovaProjectDir(),
    stdio: 'inherit',
});
console.log('4/5) build android app: DONE');
