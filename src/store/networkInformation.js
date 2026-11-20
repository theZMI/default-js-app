import { delay } from "@/helpers/delay";

export const networkInformation = {
    namespaced: true,
    state() {
        return {
            _status: '', // Нужен, чтобы устанавливать status с задержкой. Это позволяет не сразу отображать крутилку, а только через 0.5сек
            status: '', // loading, error, success, ''
            lastError: ''
        }
    },
    mutations: {
        async update(state, {status, lastError = ''}) {
            state._status = status;

            switch (status) {
                // loading будет отображаться только тогда когда запрос не успел выполниться за пару секунд
                case 'loading':
                    // Пусть какой-то запрос захотел поставить loading. Мы запишем в _status=loading и подождём пару секунд.
                    // Если спустя пару секунд _status === loading, значит запрос не завершился, пора отобразить исполнение запроса
                    await delay(2000);
                    if (state._status !== 'loading') {
                        return;
                    }
                    state.status = 'loading';
                    break;
                case 'success':
                case 'error':
                    state.status = status;
                    state.lastError = lastError;
                    break;
            }
        },
    }
}