# Default js application
Создаёт apk-шку из js приложения с помощью cordova-проекта для данного проекта с js приложением

1) Пусть у нас есть два проекта:
   - `js-app`: в нём всё что сейчас в `default-js-app`
   - `js-app-cordova` (такое же название папки как и у текущего проекта, но с -cordova в конце): в нём cordova сборка сделанная через `cordova create superApp ru.super.app superApp`
2) Исходники нашего js-приложения в /src
3) В /public должны быть точка входа (index.html) и картинки (иконка приложения, запускные экраны) 
4) Находясь в корне `js-app` запустим в терминале `make build-app`<br>
Данный make-файл:
   - запустит npm run build (сборку приложения и положит исходники в /dist)
   - сходит в /dist и подрихтует файлы чтобы они нормально собирались cordovа (относительные пути, мета-тег, codrova.js скрипт)
   - скопирует /dist в /www в cordova-проекте для данного js-приложения (тот самый проект с -cordova в конце)
   - запустит `cordova build android` для создания apk-шки из скопированного js-приложения
   - скопирует получившуюся apk-шку в `js-app/dist-apps/номер_версии.apk` (номер версии берётся из package.json) текущего js-приложения