import { delay } from "@/helpers/delay";

// Индикатор сети (компонент NetworkStatus): крутилка показывается, только если запрос
// идёт дольше LOADING_DELAY_MS, иконка «нет сети» — если ответа не было вовсе.
// Вызывается из libraries/Api.js: store.dispatch('networkInformation/update', {status, lastError}).
const LOADING_DELAY_MS = 2000;

// Счётчик запросов: «ждём 2 секунды и показываем крутилку» не должно сработать,
// если за это время запрос завершился и успел начаться следующий (раньше проверка была
// по последнему статусу, и быстрые запросы подряд давали ложную крутилку)
let loadingSeq = 0;

export const networkInformation = {
    namespaced: true,
    state() {
        return {
            status: '', // loading, error, success, ''
            lastError: '',
        }
    },
    mutations: {
        // Мутации в vuex обязаны быть синхронными — вся логика с ожиданием в действии ниже
        setStatus(state, {status, lastError = ''}) {
            state.status = status;
            if (status !== 'loading') state.lastError = lastError;
        },
    },
    actions: {
        async update({ commit }, {status, lastError = ''}) {
            const seq = ++loadingSeq;
            if (status !== 'loading') {
                commit('setStatus', {status, lastError});
                return;
            }
            await delay(LOADING_DELAY_MS);
            if (seq === loadingSeq) commit('setStatus', {status: 'loading'});
        },
    },
}
