const fs = require('fs');
const { GetJsAppProjectDir, GetCordovaProjectDir } = require("./_helpers");

const config = JSON.parse(fs.readFileSync(GetJsAppProjectDir('package.json'), 'utf-8'));
const destinationDir = GetJsAppProjectDir('dist-apps/');
const destinationApk = destinationDir + config.version + '.apk';

function CopyAndroidApp() {
    if (!fs.existsSync(destinationDir)){
        fs.mkdirSync(destinationDir);
    }

    fs.cpSync(
        GetCordovaProjectDir('platforms/android/app/build/outputs/apk/debug/app-debug.apk'),
        destinationApk,
    );
}

CopyAndroidApp();
console.log(`5/5) copy android app to ${destinationApk}: DONE`);