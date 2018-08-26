const watchmanProcessor = require('watchman-processor');
const utils = require('./utils').create();

const watchman = watchmanProcessor.processor;

module.exports = {
  create: () => {
    const emitter = utils.emitter;
    if (watchman && typeof watchman.start === 'function') {
      watchman.emitter.on('error', utils.errorHandler);
      watchman.emitter.on('setState', utils.stateUpdateHandler);
      watchman.start();
    }
    return emitter;
  },
  destroy: () => {
    return watchman.end();
  },
  UPDATE_EVENT_NAME: utils.UPDATE_EVENT_NAME,
};
