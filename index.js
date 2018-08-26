#!/usr/bin/env /usr/local/bin/node

process.env.PATH = '/usr/local/bin/:/usr/bin/';
process.title = 'watchman-processor-bitbar-plugin';
const { processor } = require('watchman-processor');
const notifier = require('node-notifier');

const watchman = processor;

if (watchman && typeof watchman.start === 'function') {
  watchman.emitter.on('error', function (params) {
    notifier.notify('Message');
   console.log(':skull:');
  });
  watchman.emitter.on('setState', function (params) {
   switch(params.state) {
     case 'good':
       notifier.notify('👍');
       console.log(':+1:');
       break;
     case 'running':
       notifier.notify('🏃');
       console.log(':running_man:');
       break;
     case 'error':
       notifier.notify('💀');
       console.log(':skull:');
       break;
   }
  });
  watchman.start()
}
process.on('SIGINT', function() {
  watchman.end().then(function() {
    process.exit();
  });
});
