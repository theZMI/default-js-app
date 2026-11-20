const { execSync } = require('child_process');
const { GetCordovaProjectDir, AssertCordovaProject } = require('./_helpers');

AssertCordovaProject();

// Сборка iOS требует полноценного Xcode (не CommandLineTools):
//   xcode-select -p  → должен указывать на /Applications/Xcode.app/...
// Без него можно только подготовить проект: cordova prepare ios (см. Makefile).
// Артефакт: platforms/ios/build/... (для устройства нужны подпись и профиль,
// проще всего открыть platforms/ios/*.xcworkspace в Xcode и собрать оттуда).

execSync('cordova build ios', {
    cwd: GetCordovaProjectDir(),
    stdio: 'inherit',
});
console.log('4/4) build ios app: DONE');
