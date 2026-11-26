// Поднимает версию приложения на единицу в последней цифре (1.0.9 → 1.0.10) в
// package.json и package-lock.json. Вызывается при каждой выкладке веб-версии и каждой
// сборке APK/iOS (см. Makefile/package.json) — у каждого выпуска свой номер, вручную
// версию поднимать не нужно.
//
// Номер общий у веба и приложений. Самообновлению APK это не мешает: сервер отдаёт
// наибольший номер среди собранных APK, и веб-версия с номером выше последнего APK
// телефону обновления не предлагает. Главное — APK всегда собирается с новым номером
// (иначе он перезапишет прошлый файл с тем же номером, и телефон его не увидит).
//
// Печатает новый номер.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function bump(version) {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
    if (!match) {
        throw new Error(`Версия в package.json не вида X.Y.Z: ${version}`);
    }
    return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

// Меняем текст, а не пересохраняем JSON целиком — форматирование файлов не трогаем.
// Версия проекта стоит в файле первой (в package-lock.json — в корне и в packages[""]),
// поэтому заменяем первые count вхождений, номера зависимостей не задевая
function replaceVersion(file, from, to, count) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) {
        return;
    }
    let text = fs.readFileSync(full, 'utf-8');
    for (let i = 0; i < count; i++) {
        const next = text.replace(`"version": "${from}"`, `"version": "${to}"`);
        if (next === text) {
            break;
        }
        text = next;
    }
    fs.writeFileSync(full, text, 'utf-8');
}

const current = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8')).version;
const next = bump(current);
replaceVersion('package.json', current, next, 1);
replaceVersion('package-lock.json', current, next, 2);
console.log(next);
