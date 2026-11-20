// Готовит собранный dist/ к работе внутри Cordova (WebView открывает его по file://):
//  - CSP-мета: Cordova без неё ругается, а `*` в CSP НЕ покрывает схемы blob:/data:,
//    поэтому они перечислены явно (картинки/звук из IndexedDB, фото с камеры, воркеры);
//  - подключение cordova.js (его кладёт сама Cordova в www/ при сборке);
//  - абсолютные пути "/..." → относительные (под file:// "/" — это корень диска).
// Скрипт идемпотентен: повторный запуск по уже подготовленному dist ничего не дублирует.
const fs = require('fs');
const path = require('path');
const { GetJsAppProjectDir, AssertDist } = require('./_helpers');

const CSP = `default-src * 'unsafe-inline' 'unsafe-eval'; ` +
    `script-src * blob: 'unsafe-inline' 'unsafe-eval'; ` +
    `worker-src * blob: data:; ` +
    `connect-src * blob: data: 'unsafe-inline'; ` +
    `media-src * data: blob:; ` +
    `img-src * data: blob: 'unsafe-inline'; ` +
    `frame-src *; ` +
    `style-src * 'unsafe-inline'; ` +
    `font-src * data:`;

function PrepareHtml() {
    const file = GetJsAppProjectDir('dist/index.html');
    let data = fs.readFileSync(file, 'utf-8');

    if (!data.includes('http-equiv="Content-Security-Policy"')) {
        data = data.replace('</head>', `<meta http-equiv="Content-Security-Policy" content="${CSP}" /></head>`);
    }
    if (!data.includes('src="cordova.js"')) {
        data = data.replace('</body>', '<script src="cordova.js"></script></body>');
    }
    data = data.replaceAll('href="/', 'href="').replaceAll('src="/', 'src="');

    fs.writeFileSync(file, data, 'utf-8');
}

function PrepareCss() {
    const dir = GetJsAppProjectDir('dist/css/');
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.css')) continue;
        const full = path.join(dir, file);
        let data = fs.readFileSync(full, 'utf-8');
        data = data.replaceAll('url(/', 'url(../');
        fs.writeFileSync(full, data, 'utf-8');
    }
}

AssertDist();
PrepareHtml();
PrepareCss();
console.log('1/5) prepare js app to cordova: DONE');
