<template>
  <div class="default-page default-page-center text-center">
    <my-loader v-if="state === 'checking'" label="Проверяем наличие обновлений..." />

    <info-block v-else-if="state === 'check-error'" css-classes="text-danger" icon="bi-x-circle-fill" :label="errorText || 'Не удалось проверить обновление'">
      <button class="btn btn-primary btn-lg btn-min-width rounded-pill" @click="checkUpdates">Проверить ещё раз</button>
    </info-block>

    <div v-else-if="state === 'downloading'">
      <my-loader :label="downloadProgress > 0 ? `Скачиваем новую версию... ${downloadProgress}%` : 'Скачиваем новую версию...'" />
      <div v-if="downloadProgress > 0" class="mt-3">
        <div class="progress" style="height: 8px; border-radius: 4px;">
          <div class="progress-bar" :style="{ width: downloadProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <info-block v-else-if="state === 'download-error'" css-classes="text-danger" icon="bi-x-circle-fill" :label="errorText || 'Не удалось скачать обновление'">
      <button class="btn btn-secondary btn-lg btn-min-width rounded-pill mb-3" @click="downloadApp">Попробовать ещё раз</button>
      <br>
      <button class="btn btn-outline-secondary btn-lg btn-min-width rounded-pill" @click="downloadViaBrowser">Скачать через браузер</button>
    </info-block>

    <info-block v-else-if="state === 'downloaded'" css-classes="text-success" icon="bi-cloud-check-fill" :label="`Версия ${latestVersion} скачана`">
      <button class="btn btn-primary btn-lg btn-min-width rounded-pill" @click="installApp">Установить</button>
    </info-block>

    <info-block v-else-if="state === 'no-updates'" css-classes="text-success" icon="bi-check-circle-fill" label="У вас установлена последняя версия приложения">
      <button class="btn btn-primary btn-lg btn-min-width rounded-pill" @click="checkUpdates">Проверить ещё раз</button>
    </info-block>

    <info-block v-else-if="state === 'has-updates'" css-classes="text-success" icon="bi-cloud-arrow-down-fill" :label="`Выпущена новая версия: ${latestVersion}`">
      <button class="btn btn-primary btn-lg btn-min-width rounded-pill" @click="downloadApp">Скачать {{ latestVersion }}</button>
    </info-block>

    <div v-else>
      <button class="btn btn-primary btn-lg btn-min-width rounded-pill" @click="checkUpdates">Проверить обновление</button>
    </div>

    <p class="mt-3" v-if="!hideVersion">
      <span class="text-secondary">Текущая версия:</span> {{ currentVersion }}
    </p>
  </div>
</template>

<script>
import {CURRENT_VERSION, checkLatestVersion, downloadApk, installApk, downloadViaBrowser as openDownloadInBrowser} from '@/native/appUpdates';
import {userErrorMessage} from '@/helpers/errors';

// Состояния: '' (ещё не проверяли) → checking → has-updates | no-updates | check-error;
// has-updates → downloading → downloaded | download-error; downloaded → (установка системой)
export default {
  name: 'CheckUpdatesPage',
  props: {
    // Страница «О приложении» показывает версию сама — дублировать её не нужно
    hideVersion: {type: Boolean, default: false},
  },
  data() {
    return {
      currentVersion: CURRENT_VERSION,
      latestVersion: '',
      state: '',
      errorText: '',
      downloadProgress: 0,
      downloadedFilePath: null,
    }
  },
  computed: {
    hasUpdates() {
      return ['has-updates', 'downloading', 'downloaded', 'download-error'].includes(this.state);
    },
  },
  methods: {
    async checkUpdates() {
      this.state = 'checking';
      this.errorText = '';
      this.downloadedFilePath = null;
      try {
        const {latest, hasUpdate} = await checkLatestVersion();
        this.latestVersion = latest;
        this.state = hasUpdate ? 'has-updates' : 'no-updates';
      } catch (e) {
        this.errorText = userErrorMessage(e, 'Не удалось проверить обновление');
        this.state = 'check-error';
      }
    },
    async downloadApp() {
      this.state = 'downloading';
      this.errorText = '';
      this.downloadProgress = 0;
      try {
        this.downloadedFilePath = await downloadApk(this.latestVersion, (p) => { this.downloadProgress = p; });
        this.state = 'downloaded';
      } catch (e) {
        this.errorText = userErrorMessage(e, 'Не удалось скачать обновление');
        this.state = 'download-error';
      }
    },
    async installApp() {
      try {
        await installApk(this.downloadedFilePath);
      } catch (e) {
        this.errorText = userErrorMessage(e, 'Не удалось запустить установку');
        this.state = 'download-error';
      }
    },
    downloadViaBrowser() {
      try {
        openDownloadInBrowser();
      } catch (e) {
        this.errorText = userErrorMessage(e, 'Не удалось открыть ссылку на обновление');
      }
    },
  },
}
</script>
