// На экранах уже минимальной ширины макета (iPhone SE 1-го поколения, старые Android — 320 px) вёрстка
// не ломается, а страница целиком уменьшается, как если бы экран был шириной в минимум: CSS zoom у <html>.
//
// Почему не meta viewport (viewport-extra: width=360, initial-scale=320/360, как было в заготовке):
// Android WebView и Chrome применяют такую смену meta к ширине макета, но масштаб оставляют 1 —
// макет 360 px обрезался справа и сдвигался пальцем вбок (проверено на эмуляторе с экраном 320 dp
// и в эмуляции Chrome). zoom уменьшает страницу везде одинаково.
//
// Высота: при zoom у одних движков 100vh/100dvh остаются высотой экрана, у других (Chrome 128+) уменьшаются
// вместе со страницей — снизу оставалась пустая полоса. Не гадаем по версии, а меряем: --app-vh-fix =
// высота экрана / видимая высота блока в 100dvh. App.vue умножает на неё высоты #app и обёртки.

// Держать в синхроне с $site-min-width в src/styles/scss/my-vars.scss
const SITE_MIN_WIDTH = 360;

export function zoomForWidth(width, minWidth = SITE_MIN_WIDTH) {
  return width > 0 && width < minWidth ? width / minWidth : 1;
}

// Во сколько раз растянуть 100dvh, чтобы под zoom он снова занимал весь экран
export function heightFix(screenHeight, probeHeight) {
  if (!(screenHeight > 0) || !(probeHeight > 0)) return 1;
  const fix = screenHeight / probeHeight;
  // Погрешность округления — не повод менять высоту
  return Math.abs(fix - 1) < 0.01 ? 1 : fix;
}

function measureHeightFix() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:100vh;height:100dvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const fix = heightFix(window.innerHeight, probe.getBoundingClientRect().height);
  probe.remove();
  return fix;
}

export function setupViewportMinWidth() {
  const root = document.documentElement;
  const update = () => {
    // Ширину экрана меряем без своего zoom: clientWidth при zoom считается в уменьшенных пикселях
    root.style.zoom = '';
    root.style.removeProperty('--app-vh-fix');
    const zoom = zoomForWidth(root.clientWidth);
    if (zoom === 1) return;
    root.style.zoom = String(zoom);
    if (document.body) root.style.setProperty('--app-vh-fix', String(measureHeightFix()));
  };
  update();
  window.addEventListener('resize', update);
}
