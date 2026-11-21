// Release-сборка для Google Play и раздачи: подписанные AAB (загружается в Play Console)
// и APK (самообновление, установка вручную) → dist-apps/<version>-release.{aab,apk}.
//
// Подпись — своим ключом из cordova-проекта (не в git!):
//   ../<имя>-cordova/signing/release.keystore   — создаётся `make keystore` (один раз на приложение)
//   ../<имя>-cordova/signing/release.json       — пароли, см. signing/release.example.json
// Ключ и пароли храните в надёжном месте (менеджер паролей + резервная копия): потеряете —
// не сможете выпускать обновления этого приложения (если не включена Play App Signing).
const fs = require('fs');
const { execSync } = require('child_process');
const {
    GetCordovaProjectDir, GetJsAppProjectDir, AssertCordovaProject, GetAppVersion,
    APK_RELEASE_PATH, AAB_RELEASE_PATH,
} = require('./_helpers');

AssertCordovaProject();

const signingConfig = GetCordovaProjectDir('signing/release.json');
if (!fs.existsSync(signingConfig)) {
    console.error(`Нет ${signingConfig}.\n` +
        'Создайте ключ (make keystore) и файл с паролями по образцу signing/release.example.json — см. README, «Release-сборка».');
    process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(signingConfig, 'utf-8'));
const keystore = cfg.android?.release?.keystore;
// Путь к ключу Cordova считает относительно самого release.json (то есть папки signing/)
if (!keystore || !fs.existsSync(GetCordovaProjectDir(`signing/${keystore}`))) {
    console.error(`Ключ подписи не найден: signing/${keystore} (путь в signing/release.json — относительно папки signing/).`);
    process.exit(1);
}

if (!fs.existsSync(GetCordovaProjectDir('platforms/android'))) {
    execSync('cordova prepare android', {cwd: GetCordovaProjectDir(), stdio: 'inherit'});
}

for (const f of [APK_RELEASE_PATH, AAB_RELEASE_PATH]) {
    if (fs.existsSync(GetCordovaProjectDir(f))) fs.unlinkSync(GetCordovaProjectDir(f));
}

// Cordova записывает пути к ключу и ПАРОЛИ открытым текстом в platforms/android/
// release-signing.properties, и Gradle потом требует ключ даже для debug-сборки
// (переместили ключ — make build-android падает). Убираем файл после сборки в любом случае.
const signingProps = GetCordovaProjectDir('platforms/android/release-signing.properties');

try {
    // Два прохода: AAB для Google Play и APK для всего остального
    for (const packageType of ['bundle', 'apk']) {
        console.log(`3/4) cordova build android --release (${packageType})...`);
        execSync(`cordova build android --release --buildConfig=signing/release.json -- --packageType=${packageType}`, {
            cwd: GetCordovaProjectDir(),
            stdio: 'inherit',
        });
    }
} finally {
    fs.rmSync(signingProps, {force: true});
}

const version = GetAppVersion();
const outDir = GetJsAppProjectDir('dist-apps/');
fs.mkdirSync(outDir, {recursive: true});
for (const [src, ext] of [[AAB_RELEASE_PATH, 'aab'], [APK_RELEASE_PATH, 'apk']]) {
    const from = GetCordovaProjectDir(src);
    if (!fs.existsSync(from)) throw new Error(`Не найден результат сборки: ${from}`);
    const to = `${outDir}${version}-release.${ext}`;
    fs.cpSync(from, to);
    console.log(`4/4) ${to}`);
}
