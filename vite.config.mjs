import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

// Локальные env-конфиги (src/envs/local.js, prod.js) в git не хранятся — у каждого
// проекта свои адреса серверов. На свежем чекауте создаём их из *.example.js,
// чтобы dev/build работали сразу; уже существующие файлы не трогаем.
function ensureEnvConfigs() {
    const envsDir = path.join(ROOT, 'src/envs');
    for (const name of ['local', 'prod']) {
        const target = path.join(envsDir, `${name}.js`);
        const example = path.join(envsDir, `${name}.example.js`);
        if (!fs.existsSync(target) && fs.existsSync(example)) {
            fs.copyFileSync(example, target);
            console.log(`[default-js-app] создан ${path.relative(ROOT, target)} из ${path.basename(example)}`);
        }
    }
}

// Иконки bootstrap-icons: пакет объявляет класс на каждую из ~2000 иконок (~80КБ CSS),
// а в приложении их несколько десятков. В продакшен-сборку попадают только те, чьи
// имена (bi-…) встречаются в src/ — в том числе в JS-строках вроде 'bi-heart-fill'.
// Имя иконки, собранное из кусков в рантайме ('bi-' + name), так не найдётся — пишите
// имена целиком. На dev-сервере генерируется полный набор: новая иконка видна сразу.
function writeBootstrapIconsGlyphs(production) {
    const codepoints = require('bootstrap-icons/font/bootstrap-icons.json');
    const glyphsFile = path.join(ROOT, 'src/styles/scss/_bootstrap-icons-glyphs.scss');
    let names = Object.keys(codepoints);
    if (production) {
        const used = new Set();
        const scan = (dir) => {
            for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) scan(full);
                // сам сгенерированный файл не в счёт: после dev в нём полный набор иконок
                else if (full !== glyphsFile && /\.(vue|js|ts|scss|html)$/.test(entry.name)) {
                    for (const m of fs.readFileSync(full, 'utf8').matchAll(/\bbi-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) used.add(m[1]);
                }
            }
        };
        scan(path.join(ROOT, 'src'));
        names = names.filter((name) => used.has(name));
    }
    const css = names.map((name) => `.bi-${name}::before { content: "\\${codepoints[name].toString(16)}"; }`).join('\n');
    const content = `// Генерируется vite.config.js — не править\n${css}\n`;
    // Не перезаписывать без изменений — иначе dev-сервер зациклится на пересборке стилей
    if (!fs.existsSync(glyphsFile) || fs.readFileSync(glyphsFile, 'utf8') !== content) {
        fs.writeFileSync(glyphsFile, content);
    }
}

export default defineConfig(({command}) => {
    ensureEnvConfigs();
    writeBootstrapIconsGlyphs(command === 'build');

    return {
        // Относительные пути к ассетам: приложение открывается и по http (сайт/PWA),
        // и по file:// в Cordova — с абсолютным "/assets/..." под file:// всё сломается.
        // С hash-роутером относительные пути безопасны и для веб-версии.
        base: './',

        // Переменные окружения сборки: VITE_* и, по старой привычке, VUE_APP_*
        // (VUE_APP_PLATFORM ставит Makefile, VUE_APP_ENV — для APK на локальный бэкенд)
        envPrefix: ['VITE_', 'VUE_APP_'],

        plugins: [vue()],

        define: {
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
            // Версия приложения из package.json (имя APK, проверка обновлений)
            __APP_VERSION__: JSON.stringify(pkg.version),
            // Метка сборки — видна на странице «О приложении»; по ней на устройстве
            // можно понять, доехал ли свежий деплой (версия меняется редко)
            __APP_BUILD_TIME__: JSON.stringify(new Date().toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })),
        },

        resolve: {
            alias: [
                {find: '@', replacement: path.join(ROOT, 'src')},
                // Старый синтаксис webpack для импорта из node_modules в SCSS: @import "~bootstrap/..."
                {find: /^~(.+)/, replacement: '$1'},
            ],
        },

        css: {
            preprocessorOptions: {
                scss: {
                    // Bootstrap 5 и наши стили пока на @import и глобальных функциях Sass —
                    // dart-sass засыпает сборку сотнями предупреждений о будущей несовместимости.
                    // Глушим только их (настоящие ошибки по-прежнему видны).
                    quietDeps: true,
                    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
                },
            },
        },

        server: {
            port: 8080,
            // Только этот компьютер. Открыть с телефона в той же Wi-Fi: VUE_DEV_HOST=0.0.0.0 npm run dev
            host: process.env.VUE_DEV_HOST || 'localhost',
        },

        build: {
            outDir: 'dist',
            // Без source map — иначе они уезжают в dist и в APK
            sourcemap: false,
            // Синтаксис для старых WebView (Android 8+ с обновлённым WebView, iOS 14+).
            // Полифилов нет — нужен совсем старый Android, подключайте @vitejs/plugin-legacy.
            target: ['es2020', 'chrome87', 'safari14'],
            // Шрифты и картинки — файлами, а не base64 в CSS/JS: браузер качает лениво
            // и только нужные сабсеты PT Sans
            assetsInlineLimit: 0,
            // Привычная структура dist/: js/, css/, fonts/, img/ — на неё рассчитаны
            // auto-build-app/prepare-to-cordova.js и service worker
            rollupOptions: {
                output: {
                    entryFileNames: 'js/[name].[hash].js',
                    chunkFileNames: 'js/[name].[hash].js',
                    assetFileNames: (asset) => {
                        const name = asset.names?.[0] || asset.name || '';
                        if (/\.css$/.test(name)) return 'css/[name].[hash][extname]';
                        if (/\.(woff2?|ttf|otf|eot)$/.test(name)) return 'fonts/[name].[hash][extname]';
                        return 'img/[name].[hash][extname]';
                    },
                },
            },
            chunkSizeWarningLimit: 600,
        },

        test: {
            environment: 'node',
            include: ['tests/**/*.test.js'],
        },
    };
});
