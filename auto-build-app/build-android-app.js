const exec = require('child_process').exec;
const { GetCordovaProjectDir } = require("./_helpers");

async function BuildAndroidApp() {
    await exec('cordova build android', {
        cwd: GetCordovaProjectDir()
    });
}

BuildAndroidApp().then( () => {
    console.log('3/4: build android app: DONE');
});