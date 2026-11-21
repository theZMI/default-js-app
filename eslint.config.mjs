// ESLint: базовые правила JS + рекомендованные для Vue 3. Запуск: npm run lint
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
    {
        ignores: ['dist/**', 'dist-apps/**', 'node_modules/**', 'native-plugins/**/www/**', 'src/styles/**'],
    },
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                // Глобальные объекты Cordova и её плагинов
                cordova: 'readonly',
                Camera: 'readonly',
                FileTransfer: 'readonly',
                // Константы, которые подставляет vite.config.mjs (define)
                __APP_VERSION__: 'readonly',
                __APP_BUILD_TIME__: 'readonly',
            },
        },
        rules: {
            // Имена страниц вида HomePage/AboutPage — составные, а UI-компоненты исторически
            // однословные в kebab-case (my-loader, info-block) — не ломаем привычные имена
            'vue/multi-word-component-names': 'off',
            'vue/component-definition-name-casing': 'off',
            // Оформление шаблонов — дело вкуса; оставляем только правила, ловящие ошибки
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            'vue/html-self-closing': 'off',
            'vue/html-indent': 'off',
            'vue/attributes-order': 'off',
            'vue/html-closing-bracket-newline': 'off',
            'vue/first-attribute-linebreak': 'off',
            'vue/require-default-prop': 'off',
            'vue/attribute-hyphenation': 'off',
            'vue/v-on-event-hyphenation': 'off',
            'no-unused-vars': ['error', {argsIgnorePattern: '^_', caughtErrors: 'none'}],
        },
    },
    {
        // Node-скрипты сборки (CommonJS)
        files: ['auto-build-app/**/*.js', 'native-plugins/**/*.js'],
        languageOptions: {sourceType: 'commonjs', globals: {...globals.node}},
    },
    {
        files: ['*.config.mjs', 'tests/**/*.js'],
        languageOptions: {globals: {...globals.node}},
    },
];
