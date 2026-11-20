import swipeDetector from '@/libraries/swipeDetector';

export default {
    __proto__: swipeDetector,
    name: 'swipe-right',
    mounted(el, binding) {
        super.mounted(
            el,
            () => {},
            () => binding.value(),
        );
    }
}