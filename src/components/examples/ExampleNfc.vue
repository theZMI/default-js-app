<template>
  <example-layout :error="error">
    <div class="ex-card text-center">
      <i class="bi bi-broadcast nfc-hero" :class="{'is-active': stop}"></i>
      <div class="mt-2 mb-3">{{ statusText }}</div>
      <div class="ex-buttons justify-content-center">
        <button v-if="status !== 'disabled'" class="btn btn-lg rounded-pill btn-min-width" :class="stop ? 'btn-secondary' : 'btn-primary'"
                @click="toggle" :disabled="status === 'unsupported'">
          {{ stop ? 'Остановить' : 'Начать сканирование' }}
        </button>
        <button v-else class="btn btn-lg btn-primary rounded-pill" @click="openNfcSettings">Открыть настройки NFC</button>
      </div>
    </div>

    <div class="ex-card">
      <div class="mb-1">Прочитанные метки</div>
      <div v-if="!tags.length" class="ex-empty">Приложите метку или карту к задней крышке телефона</div>
      <ul class="ex-list">
        <li v-for="(t, i) in tags" :key="i" class="d-block">
          <div><b>ID:</b> <span class="nfc-mono">{{ t.id || '—' }}</span> <small class="text-secondary">{{ t.time }}</small></div>
          <div v-if="t.techTypes.length" class="small text-secondary">{{ t.techTypes.map((x) => x.split('.').pop()).join(', ') }}</div>
          <div v-for="(r, j) in t.records" :key="j" class="small">Запись {{ r.type }}: {{ r.value }}</div>
        </li>
      </ul>
    </div>
  </example-layout>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {nfcStatus, startNfcScan, openNfcSettings} from '@/native/nfc';
import {vibrate, VIBRATION} from '@/native/vibration';

defineOptions({name: 'ExampleNfc'});

const status = ref('');
const stop = ref(null);
const tags = ref([]);
const error = ref('');

const statusText = computed(() => ({
  ok: stop.value ? 'Ждём метку…' : 'NFC готов',
  disabled: 'NFC выключен в настройках телефона',
  unsupported: 'На этом устройстве NFC недоступен (нужен Android-телефон с NFC)',
  '': 'Проверяем NFC…',
}[status.value]));

async function toggle() {
  error.value = '';
  if (stop.value) {
    stop.value();
    stop.value = null;
    return;
  }
  try {
    stop.value = await startNfcScan((tag) => {
      vibrate(VIBRATION.SUCCESS);
      tags.value.unshift({...tag, time: new Date().toLocaleTimeString('ru-RU')});
    });
  } catch (e) {
    error.value = e.message;
  }
}

onMounted(async () => { status.value = await nfcStatus(); });
onBeforeUnmount(() => stop.value && stop.value());
</script>

<style lang="scss" scoped>
.nfc-hero {
  font-size: 64px;
  opacity: 0.3;

  &.is-active {
    opacity: 1;
    color: #0066FF;
    animation: nfc-pulse 1.2s ease-in-out infinite;
  }
}

@keyframes nfc-pulse {
  50% { opacity: 0.4; }
}

.nfc-mono {
  font-family: monospace;
  -webkit-user-select: text;
  user-select: text;
}
</style>
