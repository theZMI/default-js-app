<template>
  <example-layout :error="error">
    <div class="ex-card text-center">
      <div class="compass" :class="{'is-off': !stop}">
        <!-- Циферблат поворачивается против направления устройства: «С» всегда смотрит на север -->
        <svg viewBox="-110 -110 220 220" class="compass-dial" :style="{transform: `rotate(${-smoothHeading}deg)`}">
          <circle r="104" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
          <g v-for="t in ticks" :key="t" :transform="`rotate(${t})`">
            <line y1="-104" :y2="t % 90 === 0 ? -88 : (t % 30 === 0 ? -94 : -99)"
                  :stroke="t === 0 ? '#FF2929' : 'rgba(255,255,255,0.5)'" :stroke-width="t % 30 === 0 ? 2 : 1" />
          </g>
          <text v-for="c in cardinals" :key="c.label" :transform="`rotate(${c.deg}) translate(0,-70) rotate(${-c.deg + smoothHeading})`"
                text-anchor="middle" dominant-baseline="central" :fill="c.deg === 0 ? '#FF2929' : '#FFF'" font-size="18">{{ c.label }}</text>
        </svg>
        <!-- Неподвижная метка «куда смотрит телефон» -->
        <div class="compass-pointer"></div>
      </div>

      <div class="ex-big-value mt-3">{{ stop && heading !== null ? `${Math.round(heading)}°` : '—' }}</div>
      <div class="text-secondary mb-3">{{ stop ? (heading === null ? 'Ждём данные датчика…' : directionName) : 'Компас выключен' }}</div>

      <button class="btn btn-lg rounded-pill btn-min-width" :class="stop ? 'btn-secondary' : 'btn-primary'" @click="toggle">
        {{ stop ? 'Выключить' : 'Включить компас' }}
      </button>
    </div>
    <p class="ex-desc">
      Если стрелка врёт — откалибруйте датчик: поводите телефоном «восьмёркой». Рядом с металлом
      и магнитами (чехлы, ноутбук) компас ошибается.
    </p>
  </example-layout>
</template>

<script setup>
import {computed, onBeforeUnmount, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {startCompass} from '@/native/compass';

defineOptions({name: 'ExampleCompass'});

const ticks = Array.from({length: 72}, (_, i) => i * 5);
const cardinals = [
  {label: 'С', deg: 0}, {label: 'В', deg: 90}, {label: 'Ю', deg: 180}, {label: 'З', deg: 270},
];
const NAMES = ['Север', 'Северо-восток', 'Восток', 'Юго-восток', 'Юг', 'Юго-запад', 'Запад', 'Северо-запад'];

const heading = ref(null);
// Плавный угол без «прыжка» 359° → 0°: копим поворот по кратчайшему пути
const smoothHeading = ref(0);
const stop = ref(null);
const error = ref('');

const directionName = computed(() => NAMES[Math.round(heading.value / 45) % 8]);

function onHeading(h) {
  heading.value = h;
  const current = ((smoothHeading.value % 360) + 360) % 360;
  let delta = h - current;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  smoothHeading.value += delta;
}

async function toggle() {
  error.value = '';
  if (stop.value) {
    stop.value();
    stop.value = null;
    return;
  }
  try {
    stop.value = await startCompass(onHeading);
  } catch (e) {
    error.value = e.message;
  }
}

onBeforeUnmount(() => stop.value && stop.value());
</script>

<style lang="scss" scoped>
.compass {
  position: relative;
  width: 260px;
  max-width: 100%;
  aspect-ratio: 1;
  margin: 10px auto 0;
  transition: opacity 0.3s;

  &.is-off {
    opacity: 0.35;
  }
}

.compass-dial {
  width: 100%;
  height: 100%;
  transition: transform 0.15s linear;
}

.compass-pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  margin-left: -10px;
  border: 10px solid transparent;
  border-top: 18px solid #0066FF;
}
</style>
