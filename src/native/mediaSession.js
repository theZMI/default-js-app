// Управление воспроизведением из шторки и экрана блокировки: название, обложка,
// кнопки «пауза / следующий / предыдущий» — для аудиогида, плеера, подкастов.
//  - веб (Chrome Android, Safari): Media Session API — показывается, пока на странице
//    играет <audio>/<video>;
//  - Android-приложение: WebView Media Session не показывает — нужен плагин
//    cordova-plugin-music-controls2 (уведомление с кнопками + кнопки гарнитуры).
//
//   setMediaSession({title, artist, album, artwork}, {play, pause, next, previous, stop})
//   setPlaybackState(true|false)   clearMediaSession()
import {FEATURES} from '@/config/features';
import {getGlobal} from '@/native/cordova';

let handlers = {};
let current = null;
let nativeSubscribed = false;

function nativePlugin() {
    return FEATURES.mediaSession ? getGlobal('MusicControls') : null;
}

function subscribeNative(mc) {
    if (nativeSubscribed) return;
    nativeSubscribed = true;
    mc.subscribe((json) => {
        const action = JSON.parse(json).message;
        const map = {
            'music-controls-play': 'play', 'music-controls-pause': 'pause',
            'music-controls-next': 'next', 'music-controls-previous': 'previous',
            'music-controls-destroy': 'stop', 'music-controls-media-button-play-pause': 'toggle',
            'music-controls-headset-unplugged': 'pause',
        };
        const name = map[action];
        if (name === 'toggle') (current?.playing ? handlers.pause : handlers.play)?.();
        else handlers[name]?.();
    });
    mc.listen();
}

export function setMediaSession(meta, actionHandlers = {}) {
    if (!FEATURES.mediaSession) return;
    handlers = actionHandlers;
    current = {...meta, playing: true};

    const mc = nativePlugin();
    if (mc) {
        mc.create({
            track: meta.title || '',
            artist: meta.artist || '',
            album: meta.album || '',
            // Пустую обложку не передаём: плагин пытается загрузить её как файл и пишет ошибку в лог
            ...(meta.artwork ? {cover: meta.artwork} : {}),
            isPlaying: true,
            dismissable: true,
            hasPrev: !!handlers.previous,
            hasNext: !!handlers.next,
            hasClose: !!handlers.stop,
            ticker: meta.title || '',
            playIcon: 'media_play', pauseIcon: 'media_pause', prevIcon: 'media_prev', nextIcon: 'media_next', closeIcon: 'media_close',
            notificationIcon: 'notification',
        });
        subscribeNative(mc);
        return;
    }

    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.title || '',
        artist: meta.artist || '',
        album: meta.album || '',
        artwork: meta.artwork ? [{src: meta.artwork, sizes: '512x512'}] : [],
    });
    const map = {play: 'play', pause: 'pause', nexttrack: 'next', previoustrack: 'previous', stop: 'stop'};
    for (const [action, key] of Object.entries(map)) {
        try {
            navigator.mediaSession.setActionHandler(action, handlers[key] || null);
        } catch (e) {
            // действие не поддерживается этим браузером
        }
    }
}

export function setPlaybackState(playing) {
    if (current) current.playing = playing;
    const mc = nativePlugin();
    if (mc) mc.updateIsPlaying(playing);
    else if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
}

export function clearMediaSession() {
    current = null;
    handlers = {};
    const mc = nativePlugin();
    if (mc) mc.destroy();
    else if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
    }
}
