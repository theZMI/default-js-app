<template>
  <example-layout :error="error">
    <div class="ex-card">
      <div class="ex-stats">
        <div><small>Сеть</small><b :class="net.online ? 'text-success' : 'text-danger'">{{ net.online ? 'Онлайн' : 'Офлайн' }}</b></div>
        <div><small>Тип соединения</small><b>{{ net.effectiveType || '—' }}</b></div>
        <div><small>Скорость (оценка)</small><b>{{ net.downlinkMbps !== null ? `${net.downlinkMbps} Мбит/с` : '—' }}</b></div>
        <div><small>Задержка</small><b>{{ net.rttMs !== null ? `${net.rttMs} мс` : '—' }}</b></div>
        <div><small>Батарея</small><b>{{ battery ? `${Math.round(battery.level * 100)}%` : '—' }}</b></div>
        <div><small>Зарядка</small><b>{{ battery ? (battery.charging ? 'Да' : 'Нет') : '—' }}</b></div>
      </div>
      <p class="small text-secondary mt-2 mb-0">Включите режим полёта — статус сети обновится сам.</p>
    </div>

    <div class="ex-card">
      <div class="mb-1">Устройство и сборка</div>
      <pre class="ex-mono">{{ info ? JSON.stringify(info, null, 2) : 'Загружаем…' }}</pre>
    </div>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {getDeviceInfo} from '@/native/device';
import {watchConnection, getBatteryInfo, getConnectionInfo} from '@/native/network';

defineOptions({name: 'ExampleDevice'});

const info = ref(null);
const net = ref(getConnectionInfo());
const battery = ref(null);
const error = ref('');
let stopWatch = null;
let batteryTimer = null;

onMounted(async () => {
  stopWatch = watchConnection((n) => { net.value = n; });
  battery.value = await getBatteryInfo();
  batteryTimer = setInterval(async () => { battery.value = await getBatteryInfo(); }, 30000);
  try {
    info.value = await getDeviceInfo();
  } catch (e) {
    error.value = 'Не удалось получить информацию об устройстве.';
  }
});

onBeforeUnmount(() => {
  stopWatch && stopWatch();
  clearInterval(batteryTimer);
});
</script>
