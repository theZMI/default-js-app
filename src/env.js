import { EnvConfig as LocalConfig } from "@/envs/local";
import { EnvConfig as ProdConfig } from "@/envs/prod";

// Какой бэкенд использует приложение. Dev-сервер (npm run serve) — local, любая сборка
// (веб для выкладки, APK, iOS) — prod: приложению на телефоне localhost недоступен.
// VUE_APP_ENV=local|prod переопределяет (например, `VUE_APP_ENV=local make build-android`
// для APK, который ходит на локальный сервер по IP).
const ENV = process.env.VUE_APP_ENV || (process.env.NODE_ENV === 'production' ? 'prod' : 'local');

export default class extends (ENV === 'local' ? LocalConfig : ProdConfig) {};
