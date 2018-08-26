const {
  app,
  nativeImage,
  Menu,
  Tray,
} = require('electron');
const watchmanProcessorListener = require('./watchman-processor-listener');
const CONTEXT_MENU = [{role: 'separator', enabled: false}, {role: 'quit'}];
app.on('ready', () => {
  const tray = new Tray(nativeImage.createEmpty());
  tray.setTitle('⚡');
  tray.setContextMenu(Menu.buildFromTemplate(CONTEXT_MENU));
  watchmanProcessorListener
    .create()
    .on(watchmanProcessorListener.UPDATE_EVENT_NAME, (params) => {
      tray.setContextMenu(
        Menu.buildFromTemplate(
          params.subscriptions
            .map((subscription) => {
              return {
                label: subscription.label,
                enabled: false,
              };
            })
            .concat(CONTEXT_MENU)
        )
      );
      tray.setTitle(params.global.icon);
    });
  app.dock.hide();
});

app.on('will-quit', function() {
  watchmanProcessorListener.destroy();
});
