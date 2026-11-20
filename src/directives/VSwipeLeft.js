import swipeDetector from '@/libraries/swipeDetector';

export default {
    __proto__: swipeDetector,
    name: 'swipe-left',
    mounted(el, binding) {
        super.mounted(
            el,
            () => binding.value(),
            () => {}
        );
    }
}