// Микрофон: запись звука и живой уровень громкости. Плагины не нужны —
// navigator.mediaDevices.getUserMedia + MediaRecorder + Web Audio есть и в браузерах,
// и в Android WebView (Cordova сама выдаёт WebView доступ, если у приложения есть
// разрешение RECORD_AUDIO — его запрашиваем через cordova-plugin-android-permissions).
//
// Веб: работает только в secure context (https или localhost).
// iOS (WKWebView, iOS 14.3+): getUserMedia есть; нужен NSMicrophoneUsageDescription в config.xml.
import {FEATURES} from '@/config/features';
import {deviceReady} from '@/native/cordova';
import {ensurePermission, PERMISSIONS} from '@/native/permissions';

export function isMicrophoneAvailable() {
    return FEATURES.microphone && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Формат записи: первый поддерживаемый (Chrome/Android — webm/opus, Safari — mp4/aac)
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];

function pickMimeType() {
    if (typeof MediaRecorder === 'undefined') return null;
    return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
}

function micErrorMessage(e) {
    if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') return 'Нет доступа к микрофону — разрешите его в настройках.';
    if (e?.name === 'NotFoundError') return 'Микрофон не найден.';
    if (e?.name === 'NotReadableError') return 'Микрофон занят другим приложением.';
    return 'Не удалось включить микрофон.';
}

async function openStream() {
    if (!isMicrophoneAvailable()) throw new Error('Микрофон недоступен в этом браузере.');
    await deviceReady();
    if (!(await ensurePermission(PERMISSIONS.RECORD_AUDIO))) {
        throw new Error('Нет доступа к микрофону — разрешите его в настройках.');
    }
    try {
        return await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}});
    } catch (e) {
        throw new Error(micErrorMessage(e), {cause: e});
    }
}

// Уровень громкости 0..1 (RMS сигнала), onLevel вызывается ~60 раз в секунду
function attachLevelMeter(stream, onLevel) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx || !onLevel) return () => {};
    const ctx = new AudioCtx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    let raf = 0;
    const tick = () => {
        analyser.getFloatTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
        // RMS речи обычно 0.01..0.3 — растягиваем, чтобы индикатор был живым
        onLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
        raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
        cancelAnimationFrame(raf);
        source.disconnect();
        ctx.close();
    };
}

function stopStream(stream) {
    stream.getTracks().forEach((t) => t.stop());
}

/** Только индикатор громкости (без записи). Возвращает Promise<stop()>. */
export async function startLevelMeter(onLevel) {
    const stream = await openStream();
    const detach = attachLevelMeter(stream, onLevel);
    return () => {
        detach();
        stopStream(stream);
    };
}

/**
 * Начать запись. Возвращает {stop, cancel}:
 *   stop()   → Promise<{blob, url, mimeType, durationMs}>
 *   cancel() — прервать без результата
 * options.onLevel(0..1) — живой уровень громкости.
 */
export async function startRecording({onLevel} = {}) {
    const mimeType = pickMimeType();
    if (mimeType === null) throw new Error('Запись звука не поддерживается этим браузером.');
    const stream = await openStream();
    const detach = attachLevelMeter(stream, onLevel);
    const recorder = new MediaRecorder(stream, mimeType ? {mimeType} : undefined);
    const chunks = [];
    const startedAt = Date.now();
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.start(250); // кусками по 250 мс — запись не теряется целиком при сбое

    const cleanup = () => {
        detach();
        stopStream(stream);
    };

    return {
        stop() {
            return new Promise((resolve, reject) => {
                recorder.onstop = () => {
                    cleanup();
                    const type = recorder.mimeType || mimeType || 'audio/webm';
                    const blob = new Blob(chunks, {type});
                    // Android WebView: первая запись сразу после системного диалога разрешения
                    // иногда приходит пустой (поток открылся, пока активность была на паузе).
                    // Пустой файл не воспроизводится — сообщаем, а не сохраняем мусор.
                    if (!blob.size) {
                        reject(new Error('Запись получилась пустой — попробуйте ещё раз.'));
                        return;
                    }
                    resolve({blob, url: URL.createObjectURL(blob), mimeType: type, durationMs: Date.now() - startedAt});
                };
                recorder.stop();
            });
        },
        cancel() {
            recorder.onstop = cleanup;
            if (recorder.state !== 'inactive') recorder.stop();
        },
    };
}
