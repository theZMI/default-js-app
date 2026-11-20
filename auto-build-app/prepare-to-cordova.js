// Готовит собранный dist/ к работе внутри Cordova (WebView открывает его по file://):
//  - CSP-мета: Cordova без неё ругается, а `*` в CSP НЕ покрывает схемы blob:/data:,
//    поэтому они перечислены явно (картинки/звук из IndexedDB, фото с камеры, воркеры);
//  - подключение cordova.js (его кладёт сама Cordova в www/ при сборке);
//  - абсолютные пути "/..." → относительные (под file:// "/" — это корень диска).
// Скрипт идемпотентен: повторный запуск по уже подготовленному dist ничего не дублирует.
const fs = require('fs');
const path = require('path');
const { GetJsAppProjectDir, AssertDist } = require('./_helpers');

// 'unsafe-eval' не нужен: Vue 3 собирается runtime-only (шаблоны компилируются при сборке),
// а без него XSS не может выполнить строку как код через eval/new Function.
// 'unsafe-inline' пока остаётся — в index.html инлайн-скрипт запрета жестов-зума.
// object-src 'none' и base-uri 'self' — закрывают плагины и подмену базового URL.
const CSP = `default-src * 'unsafe-inline'; ` +
    `script-src 'self' blob: 'unsafe-inline'; ` +
    `object-src 'none'; ` +
    `base-uri 'self'; ` +
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
    // "/x" → "x", но "//cdn.example.com/x" (протокол-относительные ссылки) не трогаем
    data = data.replace(/(href|src)="\/(?!\/)/g, '$1="');

    fs.writeFileSync(file, data, 'utf-8');
}

function PrepareCss() {
    const dir = GetJsAppProjectDir('dist/css/');
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.css')) continue;
        const full = path.join(dir, file);
        let data = fs.readFileSync(full, 'utf-8');
        data = data.replace(/url\((['"]?)\/(?!\/)/g, 'url($1../');
        fs.writeFileSync(full, data, 'utf-8');
    }
}

AssertDist();
PrepareHtml();
PrepareCss();
console.log('1/5) prepare js app to cordova: DONE');
