const fs = require('fs');
const { GetCordovaProjectDir, GetJsAppProjectDir, AssertCordovaProject, AssertDist } = require('./_helpers');

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

AssertCordovaProject();
AssertDist();
ClearCordovaProject();
CopyJsAppToCordovaProject();
console.log(`2/5) js app copy into cordova project (${GetCordovaProjectDir('www/')}): DONE`);
