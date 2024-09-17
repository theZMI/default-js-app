const fs = require('fs');
const exec = require('child_process').exec;
const { GetCordovaProjectDir } = require("./_helpers");

const oldApkFile = GetCordovaProjectDir('platforms/android/app/build/outputs/apk/debug/app-debug.apk');
if (fs.existsSync(oldApkFile)) {
    fs.unlinkSync(oldApkFile);
    console.log('3/5) remove old app-debug into cordova-project directory: DONE');
} else {
    console.log('3/5) no found old app-debug: DONE');
}

async function BuildAndroidApp() {
    await exec('cordova build android', {
        cwd: GetCordovaProjectDir()
    });
}

BuildAndroidApp().then( () => {
    console.log('4/5) build android app: DONE');
});