# Default js application
Создаёт apk-шку из js приложения с помощью cordova-проекта для данного проекта с js приложением

1) Пусть у нас есть два проекта:
   - `js-app`: в нём всё что сейчас в `default-js-app`
   - `js-app-cordova` (такое же название папки как и у текущего проекта, но с -cordova в конце): в нём cordova-ная сборка
     (сделанная например через `cordova create superApp ru.super.app superApp`)
2) Исходники нашего js-приложения лежат в js-app/src
3) В js-app/public будет приложение которое мы разрабатывает для онлайн-а (index.html, js-ки, css-ки, картинки и пр)
4) В js-app/dist то же самое js-приложение что и в public, только уже скомпиленное для выкладки на прод или для превращения в apk-шку
4) D js-app/dist-apps наши скрипты лежащие в auto-build-app положат apk-шку сделанную из js-app/dist

# Как запустить создание apk-шки
1) Находясь в корне `js-app` запустим в терминале `make build-app`<br>
Данная команда запустит:
   - `npm run build` (сделает сборку приложения и положит исходники в js-app/dist)
   - сходит в js-app/dist и подредактирует файлы чтобы они нормально собирались в приложение для cordovа (поставит относительные пути везде, добавит мета-тег, добавит codrova.js скрипт в конце страницы)
   - скопирует js-app/dist в js-app-cordova/www
   - запустит `cordova build android` для создания apk-шки из скопированного js-приложения
   - скопирует получившуюся apk-шку назад в `js-app/dist-apps/номер_версии.apk` (номер версии берётся из package.json) текущего js-приложения

# Зависимости
1) android studio (необязательно, но намного удобнее через неё ставить sdk и виртуально тестить)
2) android sdk
3) java virtual machines
4) gradle
2) cordova
3) npm

Всё необходимо прописать в, например, `.bash_profile`.
Должно получиться что-то вроде такого:
```shell
source ~/.profile
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
export PATH="/opt/homebrew/opt/gradle@8/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export ANDROID_AVD_HOME=~/.android/avd
```