const fs = require('fs');
const { GetCordovaProjectDir, GetJsAppProjectDir, AssertCordovaProject, AssertDist, GetAppVersion } = require('./_helpers');

function ClearCordovaProject() {
    // maxRetries: на macOS рекурсивное удаление иногда падает с ENOTEMPTY из-за гонки
    // (Finder/Spotlight успевают создать .DS_Store внутри удаляемой папки)
    fs.rmSync(
        GetCordovaProjectDir('www/'),
        { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }
    );
}

function CopyJsAppToCordovaProject() {
    fs.cpSync(
        GetJsAppProjectDir('dist/'),
        GetCordovaProjectDir('www/'),
        // .gitkeep из dist в www не нужен
        { recursive: true, filter: (src) => !src.endsWith('.gitkeep') && !src.endsWith('.DS_Store') }
    );
}

// Версия приложения в config.xml = version из package.json js-приложения. Из неё Cordova
// считает versionCode Android (1.2.3 → 10203): Google Play и установка APK поверх старого
// требуют, чтобы он рос. Раньше в config.xml всегда было 1.0.0 — все сборки были «одной версии».
function SyncVersion() {
    const file = GetCordovaProjectDir('config.xml');
    const version = GetAppVersion();
    const xml = fs.readFileSync(file, 'utf-8');
    const updated = xml.replace(/(<widget\b[^>]*\sversion=")[^"]*(")/, `$1${version}$2`);
    if (updated !== xml) {
        fs.writeFileSync(file, updated, 'utf-8');
        console.log(`   config.xml: version → ${version}`);
    }
}

AssertCordovaProject();
AssertDist();
SyncVersion();
ClearCordovaProject();
CopyJsAppToCordovaProject();
console.log(`2/5) js app copy into cordova project (${GetCordovaProjectDir('www/')}): DONE`);
