// Свайп влево/вправо по элементу (директивы v-swipe-left / v-swipe-right).
const MIN_SWIPE_OFFSET = 100;
const Y_OFFSET_WRONG_SWIPE_DETECT = 100;

export default {
    mounted(el, swipeLeftCallback, swipeRightCallback) {
        let start = null;

        const touchStart = (event) => {
            // Только один палец: мультитач (пинч) — не свайп
            start = event.touches.length === 1
                ? {x: event.touches[0].clientX, y: event.touches[0].clientY}
                : null;
        };

        const touchEnd = (event) => {
            if (!start || event.changedTouches.length !== 1) return;
            const xOffset = event.changedTouches[0].clientX - start.x;
            const yOffset = event.changedTouches[0].clientY - start.y;
            start = null;
            if (Math.abs(xOffset) < MIN_SWIPE_OFFSET) return; // слишком короткий
            if (Math.abs(yOffset) > Y_OFFSET_WRONG_SWIPE_DETECT) return; // это вертикальная прокрутка
            (xOffset > 0 ? swipeRightCallback : swipeLeftCallback)();
        };

        const touchCancel = () => { start = null; };

        // Раньше touchend вешался на window при каждом касании и не снимался при
        // размонтировании элемента — теперь слушатели на самом элементе и снимаются
        el.addEventListener('touchstart', touchStart, {passive: true});
        el.addEventListener('touchend', touchEnd, {passive: true});
        el.addEventListener('touchcancel', touchCancel, {passive: true});
        el.__swipeCleanup = () => {
            el.removeEventListener('touchstart', touchStart);
            el.removeEventListener('touchend', touchEnd);
            el.removeEventListener('touchcancel', touchCancel);
        };
    },
    unmounted(el) {
        if (el.__swipeCleanup) el.__swipeCleanup();
        delete el.__swipeCleanup;
    },
}
