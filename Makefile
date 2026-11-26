# --- Сборка под конкретную платформу --------------------------------------------
# Каждая цель передаёт VUE_APP_PLATFORM — он перекрывает EnvConfig.PLATFORM из
# src/envs/*.js (см. src/config/platform.js), так что все версии собираются
# из одного env-конфига, без ручной правки перед сборкой.
# Платформу можно переопределить: `make build-android PLATFORM=web`.
#
# Cordova-проект — соседняя папка с тем же именем и суффиксом -cordova.

CORDOVA_DIR := ../$(notdir $(CURDIR))-cordova
APP_VERSION = $(shell node -p "require('./package.json').version")

build-web:     PLATFORM = web
build-android: PLATFORM = android
build-ios:     PLATFORM = ios
prepare-ios:   PLATFORM = ios

# Зависимости js-приложения и cordova-проекта (платформу android и плагины
# build-android-app.js поставит при первой сборке — cordova prepare по package.json cordova-проекта)
install:
	npm install
	cd $(CORDOVA_DIR) && npm install

# Dev-сервер с горячей перезагрузкой: http://localhost:8080
start:
	npm run dev

# Проверки кода: ESLint и автотесты (vitest)
lint:
	npm run lint

test:
	npm test

# Веб-версия — статика в dist/ (hash-роутер, отдельный сервер не нужен)
build-web:
	VUE_APP_PLATFORM=$(PLATFORM) npm run build

# Android-приложение (debug APK) → dist-apps/<version из package.json>.apk.
# Каждая сборка APK/iOS и выкладка веба поднимает версию (scripts/bump-version.mjs)
build-android:
	node scripts/bump-version.mjs
	VUE_APP_PLATFORM=$(PLATFORM) npm run build
	node auto-build-app/prepare-to-cordova.js
	node auto-build-app/copy-to-cordova-project.js
	node auto-build-app/build-android-app.js
	node auto-build-app/move-android-app.js

# Release для Google Play / раздачи: подписанные AAB и APK → dist-apps/<version>-release.{aab,apk}.
# Перед первой сборкой: make keystore и signing/release.json в cordova-проекте (см. README).
# Версия поднимается сама (scripts/bump-version.mjs) — Google Play примет только бо́льшую.
build-android-release:
	node scripts/bump-version.mjs
	VUE_APP_PLATFORM=android npm run build
	node auto-build-app/prepare-to-cordova.js
	node auto-build-app/copy-to-cordova-project.js
	node auto-build-app/build-android-release.js

# Ключ подписи release-сборок (один раз на приложение). Спросит пароли и данные владельца.
# Ключ — в ../<имя>-cordova/signing/ (не в git). ПОТЕРЯТЬ НЕЛЬЗЯ: сделайте резервную копию.
keystore:
	mkdir -p $(CORDOVA_DIR)/signing
	keytool -genkeypair -v -keystore $(CORDOVA_DIR)/signing/release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000

# Поставить последний собранный APK на подключённый телефон/эмулятор (нужен adb)
install-android:
	adb install -r dist-apps/$(APP_VERSION).apk

# iOS-приложение. Требует установленного Xcode (xcode-select -p -> Xcode.app);
# артефакт — в $(CORDOVA_DIR)/platforms/ios/build (или собрать из .xcworkspace)
build-ios:
	node scripts/bump-version.mjs
	VUE_APP_PLATFORM=$(PLATFORM) npm run build
	node auto-build-app/prepare-to-cordova.js
	node auto-build-app/copy-to-cordova-project.js
	node auto-build-app/build-ios-app.js

# Без Xcode: только подготовка iOS-проекта (www + плагины + Info.plist)
prepare-ios:
	VUE_APP_PLATFORM=$(PLATFORM) npm run build
	node auto-build-app/prepare-to-cordova.js
	node auto-build-app/copy-to-cordova-project.js
	cd $(CORDOVA_DIR) && cordova prepare ios

# Выкладка веб-версии: новая версия, сборка, заливка общим скриптом хостинга
# (../hosting/deploy_static_apps.py, доступ к FTP — там же). DEPLOY_KEY — имя приложения
# в этом скрипте (словарь APPS), например: DEPLOY_KEY := magic-ball
DEPLOY_KEY ?=
deploy:
	@test -n "$(DEPLOY_KEY)" || (echo "Задайте DEPLOY_KEY в Makefile — имя приложения в ../hosting/deploy_static_apps.py" && exit 1)
	node scripts/bump-version.mjs
	$(MAKE) build-web
	python3 ../hosting/deploy_static_apps.py $(DEPLOY_KEY)

# Все иконки (веб, PWA, Android, iOS) из resources/icon.png — см. scripts/generate-icons.py
icons:
	python3 scripts/generate-icons.py

# Старые имена целей — псевдонимы, чтобы не ломать привычку
build-app: build-android
build-app-ios: build-ios
build-dist: build-web

.PHONY: install start lint test deploy build-web build-android build-android-release keystore install-android build-ios prepare-ios icons build-app build-app-ios build-dist
