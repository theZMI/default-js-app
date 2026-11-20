package pro.thezmi.cordova.openlink;

import android.content.Intent;
import android.net.Uri;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;

// Ссылки, которыми открыли приложение (intent-filter'ы в plugin.xml), передаются в JS.
// Запуск по ссылке — адрес в интенте активности, он ждёт, пока JS подпишется (listen);
// приложение уже открыто — ссылка приходит в onNewIntent (MainActivity — singleTop).
public class OpenLinkPlugin extends CordovaPlugin {
    private CallbackContext listener;
    private String pending;

    @Override
    protected void pluginInitialize() {
        pending = takeLink(cordova.getActivity().getIntent());
    }

    @Override
    public void onNewIntent(Intent intent) {
        String link = takeLink(intent);
        if (link != null) deliver(link);
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        if (!"listen".equals(action)) return false;
        listener = callbackContext;
        PluginResult noResult = new PluginResult(PluginResult.Status.NO_RESULT);
        noResult.setKeepCallback(true);
        listener.sendPluginResult(noResult);
        if (pending != null) {
            String link = pending;
            pending = null;
            deliver(link);
        }
        return true;
    }

    private void deliver(String link) {
        if (listener == null) {
            pending = link;
            return;
        }
        PluginResult result = new PluginResult(PluginResult.Status.OK, link);
        result.setKeepCallback(true);
        listener.sendPluginResult(result);
    }

    // Забирает ссылку из интента и стирает её там: при пересоздании активности (поворот
    // экрана, возврат из фона) тот же интент не должен открыть плейлист второй раз
    private static String takeLink(Intent intent) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction())) return null;
        Uri data = intent.getData();
        if (data == null) return null;
        intent.setData(null);
        return data.toString();
    }
}
