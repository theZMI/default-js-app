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

# Dev-сервер с горячей перезагрузкой
start:
	npm run serve

# Веб-версия — статика в dist/ (hash-роутер, отдельный сервер не нужен)
build-web:
	VUE_APP_PLATFORM=$(PLATFORM) npm run build

# Android-приложение (debug APK) → dist-apps/<version из package.json>.apk
build-android:
	VUE_APP_PLATFORM=$(PLATFORM) npm run build
	node auto-build-app/prepare-to-cordova.js
	node auto-build-app/copy-to-cordova-project.js
	node auto-build-app/build-android-app.js
	node auto-build-app/move-android-app.js

# Поставить последний собранный APK на подключённый телефон/эмулятор (нужен adb)
install-android:
	adb install -r dist-apps/$(APP_VERSION).apk

# iOS-приложение. Требует установленного Xcode (xcode-select -p -> Xcode.app);
# артефакт — в $(CORDOVA_DIR)/platforms/ios/build (или собрать из .xcworkspace)
build-ios:
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

# Все иконки (веб, PWA, Android, iOS) из resources/icon.png — см. scripts/generate-icons.py
icons:
	python3 scripts/generate-icons.py

# Старые имена целей — псевдонимы, чтобы не ломать привычку
build-app: build-android
build-app-ios: build-ios
build-dist: build-web

.PHONY: install start build-web build-android install-android build-ios prepare-ios icons build-app build-app-ios build-dist
