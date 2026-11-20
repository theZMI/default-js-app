// На экранах уже минимальной ширины макета сайт не ломает вёрстку, а масштабируется
// целиком, как если бы ширина была равна минимальной: viewport-extra переписывает
// meta viewport в width=<минимум>, initial-scale=<фактическая ширина>/<минимум>.
// На экранах шире минимума остаётся обычный width=device-width, initial-scale=1.
import {apply} from 'viewport-extra';

// Держать в синхроне с $site-min-width в src/styles/scss/my-vars.scss
const SITE_MIN_WIDTH = 360;

export function setupViewportMinWidth() {
  const update = () => {
    // Рецепт из README viewport-extra: apply() сам меняет ширину вьюпорта и породил бы
    // бесконечный цикл resize→apply→resize, поэтому следующий пересчёт подписывается
    // только после того, как ResizeObserver зафиксирует итоговый размер документа.
    new ResizeObserver((entries, observer) => {
      observer.unobserve(document.documentElement);
      window.addEventListener('resize', update, {once: true});
    }).observe(document.documentElement);
    // viewport-fit=cover приходится передавать явно: apply() собирает content меты
    // заново и исходное значение из index.html теряет. Без cover в standalone на iOS
    // не работают env(safe-area-inset-*)
    apply([{content: {minWidth: SITE_MIN_WIDTH, 'viewport-fit': 'cover'}}]);
  };
  update();
}
