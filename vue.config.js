const { defineConfig } = require('@vue/cli-service')
const { DefinePlugin } = require('webpack')

const fs = require('fs');
const path = require('path');

// Локальные env-конфиги (src/envs/local.js, prod.js) в git не хранятся — у каждого
// проекта свои адреса серверов. На свежем чекауте создаём их из *.example.js,
// чтобы serve/build работали сразу; уже существующие файлы не трогаем.
function ensureEnvConfigs() {
    const envsDir = path.resolve(__dirname, 'src/envs');
    for (const name of ['local', 'prod']) {
        const target = path.join(envsDir, `${name}.js`);
        const example = path.join(envsDir, `${name}.example.js`);
        if (!fs.existsSync(target) && fs.existsSync(example)) {
            fs.copyFileSync(example, target);
            console.log(`[default-js-app] создан ${path.relative(__dirname, target)} из ${path.basename(example)}`);
        }
    }
}
ensureEnvConfigs();

// Иконки bootstrap-icons: пакет объявляет класс на каждую из ~2000 иконок (~80КБ CSS),
// а в приложении их несколько десятков. В продакшен-сборку попадают только те, чьи
// имена (bi-…) встречаются в src/ — в том числе в JS-строках вроде 'bi-heart-fill'.
// Имя иконки, собранное из кусков в рантайме ('bi-' + name), так не найдётся — пишите
// имена целиком. На serve генерируется полный набор: новая иконка видна без перезапуска.
function writeBootstrapIconsGlyphs() {
    const codepoints = require('bootstrap-icons/font/bootstrap-icons.json');
    const glyphsFile = path.resolve(__dirname, 'src/styles/scss/_bootstrap-icons-glyphs.scss');
    let names = Object.keys(codepoints);
    if (process.env.NODE_ENV === 'production') {
        const used = new Set();
        const scan = (dir) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) scan(full);
                // сам сгенерированный файл не в счёт: после serve в нём полный набор иконок
                else if (full !== glyphsFile && /\.(vue|js|ts|scss|html)$/.test(entry.name)) {
                    for (const m of fs.readFileSync(full, 'utf8').matchAll(/\bbi-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) used.add(m[1]);
                }
            }
        };
        scan(path.resolve(__dirname, 'src'));
        names = names.filter((name) => used.has(name));
    }
    const css = names.map((name) => `.bi-${name}::before { content: "\\${codepoints[name].toString(16)}"; }`).join('\n');
    fs.writeFileSync(glyphsFile, `// Генерируется vue.config.js — не править\n${css}\n`);
}
writeBootstrapIconsGlyphs();

module.exports = defineConfig({
    // Карты исходников в продакшене не нужны — без этого они уезжают в dist и в APK
    productionSourceMap: false,
    // Относительные пути к ассетам: ленивые чанки подгружаются в рантайме, и с
    // абсолютным "/js/..." они ломаются под file:// в Cordova. С hash-роутером
    // относительные пути безопасны и для веб-версии.
    publicPath: './',
    transpileDependencies: true,
    css: {
        loaderOptions: {
            scss: {
                // Bootstrap 5 и наши стили пока на @import и глобальных функциях Sass —
                // dart-sass засыпает сборку сотнями предупреждений о будущей несовместимости.
                // Глушим только их (настоящие ошибки по-прежнему видны). Переезд на @use
                // потребует и обновления Bootstrap (6+).
                sassOptions: {
                    quietDeps: true,
                    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'legacy-js-api', 'if-function'],
                },
            },
        },
    },
    chainWebpack: config => {
        config.plugin('add_flag')
            .use(DefinePlugin, [{
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
                // Версия приложения из package.json (имя APK, проверка обновлений). Константой,
                // а не import package.json — иначе в бандл уезжает весь package.json
                __APP_VERSION__: JSON.stringify(require('./package.json').version),
                // Метка сборки — видна на странице «О приложении»; по ней на устройстве
                // можно понять, доехал ли свежий деплой (версия в package.json меняется редко)
                __APP_BUILD_TIME__: JSON.stringify(new Date().toLocaleString('ru-RU', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })),
            }]);
        // Шрифты — отдельными файлами, а не base64 внутри CSS: инлайн тащил все
        // сабсеты PT Sans (включая курсивы) в первый байт стилей, а внешние файлы
        // браузер качает лениво и только те unicode-range, что реально нужны.
        config.module.rule('fonts').set('parser', {dataUrlCondition: {maxSize: 0}});
        // svgo в минификаторе CSS не умеет разбирать url-encoded SVG из Bootstrap
        // (иконки чекбоксов/селектов) и предупреждает на каждой сборке; выигрыша от него
        // на паре инлайн-SVG нет — выключаем только его.
        if (process.env.NODE_ENV === 'production') {
            config.optimization.minimizer('css').tap(args => {
                args[0].minimizerOptions = {preset: ['default', {svgo: false}]};
                return args;
            });
        }
    },
    configureWebpack: {
        resolve: {
            // Node-модули, которые некоторые npm-пакеты упоминают только для окружения
            // Node, — в браузерной сборке достаточно пустых заглушек. Понадобится реальный
            // полифил (например sql.js просит path/crypto) — поставьте path-browserify /
            // crypto-browserify и пропишите их здесь через require.resolve().
            fallback: {
                fs: false,
                path: false,
                crypto: false,
                stream: false,
            },
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        },
    },
})
