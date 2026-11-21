<template>
  <example-layout :error="error">
    <!-- Вошли -->
    <section v-if="auth.loggedIn" class="ex-card">
      <div class="auth-profile">
        <div class="auth-avatar"><i class="bi bi-person-fill"></i></div>
        <div class="flex-grow-1">
          <div>{{ auth.user?.name || auth.user?.email }}</div>
          <div class="small text-secondary">{{ auth.user?.email }}</div>
        </div>
        <button class="ex-icon-btn" @click="doLogout" aria-label="Выйти"><i class="bi bi-box-arrow-right"></i></button>
      </div>

      <div v-if="bio.available" class="mt-3">
        <div class="form-check form-switch">
          <input id="auth-bio" class="form-check-input" type="checkbox" :checked="auth.biometric" @change="toggleBio($event.target.checked)">
          <label class="form-check-label" for="auth-bio">Подтверждать вход отпечатком / лицом</label>
        </div>
        <button v-if="auth.biometric" class="btn btn-secondary rounded-pill mt-2" @click="check">Проверить сейчас</button>
        <div v-if="bioResult" class="small mt-2" :class="bioResult === 'ok' ? 'text-success' : 'text-secondary'">
          {{ bioResult === 'ok' ? 'Подтверждено' : 'Отменено' }}
        </div>
      </div>
      <div v-else class="small text-secondary mt-3">{{ bio.reason }}</div>
    </section>

    <!-- Вход -->
    <section v-else class="ex-card">
      <div class="small text-secondary mb-3" v-if="demo">Демо-режим: сервер не нужен, код — <b>1234</b>.</div>
      <form v-if="step === 'email'" class="auth-form" @submit.prevent="sendCode">
        <input v-model.trim="email" type="email" class="form-control" placeholder="Почта" autocomplete="email" required>
        <button type="submit" class="btn btn-primary rounded-pill w-100" :disabled="busy">{{ busy ? 'Отправляем…' : 'Получить код' }}</button>
      </form>
      <form v-else class="auth-form" @submit.prevent="doLogin">
        <div class="small">Код отправлен на {{ email }}</div>
        <input v-model.trim="code" class="form-control auth-code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="Код" required>
        <button type="submit" class="btn btn-primary rounded-pill w-100" :disabled="busy">{{ busy ? 'Проверяем…' : 'Войти' }}</button>
        <button type="button" class="btn btn-link text-secondary" @click="step = 'email'">Другая почта</button>
      </form>
    </section>
  </example-layout>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {auth, requestCode, login, logout, setBiometricLogin} from '@/libraries/auth';
import {isBiometricAvailable, verifyBiometric} from '@/native/biometric';
import {APP} from '@/config/app';
import {userErrorMessage} from '@/helpers/errors';

defineOptions({name: 'ExampleAuth'});

const demo = APP.AUTH.DEMO;
const step = ref('email');
const email = ref('');
const code = ref('');
const busy = ref(false);
const error = ref('');
const bio = reactive({available: false, reason: ''});
const bioResult = ref('');

async function sendCode() {
  error.value = '';
  busy.value = true;
  try {
    await requestCode(email.value);
    step.value = 'code';
  } catch (e) {
    error.value = userErrorMessage(e, 'Не удалось отправить код.');
  }
  busy.value = false;
}

async function doLogin() {
  error.value = '';
  busy.value = true;
  try {
    await login(email.value, code.value);
    code.value = '';
    step.value = 'email';
  } catch (e) {
    error.value = userErrorMessage(e, 'Не удалось войти.');
  }
  busy.value = false;
}

async function doLogout() {
  await logout();
}

async function check() {
  error.value = bioResult.value = '';
  try {
    bioResult.value = (await verifyBiometric({title: 'Вход в Default JS App'})) ? 'ok' : 'cancel';
  } catch (e) {
    error.value = e.message;
  }
}

async function toggleBio(enabled) {
  // Включение — тоже через подтверждение, иначе любой взявший телефон его отключит/включит
  if (enabled && !(await verifyBiometric({title: 'Включить вход по отпечатку'}).catch(() => false))) return;
  setBiometricLogin(enabled);
}

onMounted(async () => {
  Object.assign(bio, await isBiometricAvailable());
});
</script>

<style lang="scss" scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auth-code {
  text-align: center;
  font-size: 24px !important;
  letter-spacing: 8px;
}

.auth-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0066FF;
  color: #FFF;
  font-size: 22px;
}
</style>
