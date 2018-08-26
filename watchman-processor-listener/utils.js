const {EventEmitter} = require('events');

/**
 * Subscription state object
 * @typedef {Object} SubscriptionState
 * @property {string} name - The name of the subscription
 * @property {STATE} state - The state of the subscription
 * @property {STATE_ICON} icon - The icon representing this state
 * @property {string} label - The label of the subscription
 * (a concatenation of the name and state properties)
 */

/**
 * Global state object
 * @typedef {Object} GlobalState
 * @property {STATE} state - The global state
 * results of each individual subscription's state
 * @property {STATE_ICON} icon - The icon associated with the global state
 */

const GOOD = '👍';
const RUNNING = '🏃';
const ERROR = '💀';
const UNKNOWN = '⁉';
/**
 * Enum representing watchman-processor states
 * @readonly
 * @enum {string}
 */
const STATE = {
  GOOD: 'good',
  RUNNING: 'running',
  ERROR: 'error',
  UNKNOWN: 'unknown',
};

/**
 * Enum representing icons for watchman-processor {@link STATE}
 * @readonly
 * @enum {string}
 */
const STATE_ICON = {};
STATE_ICON[STATE.GOOD] = GOOD;
STATE_ICON[STATE.RUNNING] = RUNNING;
STATE_ICON[STATE.ERROR] = ERROR;
STATE_ICON[STATE.UNKNOWN] = UNKNOWN;
const UPDATE_EVENT_NAME = 'update';

/**
 * Get the {@link STATE} or return {@link STATE.unknown} by default
 * @param {string} state - The state
 * @return {STATE}
 */
function getState(state) {
  return STATE[`${state}`.toUpperCase()] || STATE.UNKNOWN;
}

/**
 * Get the {@link STATE_ICON} associated with {@link STATE}
 * or return {@link STATE.unknown} by default
 * @param {STATE} state - The state
 * @return {STATE_ICON}
 */
function getStateIcon(state) {
  return STATE_ICON[state] || UNKNOWN;
}

/**
 * Get the {@link GlobalState} object
 * Global state is a combination of the STATE of individual subscriptions
 * If all GOOD => GOOD;
 * If one RUNNING => RUNNING;
 * If one ERROR => ERROR;
 * If no state => UNKNOWN;
 * @param {Object} subscriptionStates - The object representing
 * the {@link STATE} of each subscription
 * @return {GlobalState}
 */
function getGlobalState(subscriptionStates) {
  const allStates = Object.values(subscriptionStates);
  if (allStates.length === 0) {
    return STATE.UNKNOWN;
  }
  if (allStates.includes(STATE.RUNNING)) {
    return STATE.RUNNING;
  } else if (allStates.includes(STATE.ERROR)) {
    return STATE.ERROR;
  } else if (allStates.includes(STATE.UNKNOWN)) {
    return STATE.UNKNOWN;
  }
  return STATE.GOOD;
}

/**
 * Create an object that represents the state of a subscription
 * @param {string} name - The subscription name
 * @param {STATE} state - The {@link STATE} of this subscription
 * @return {SubscriptionState}
 */
function getSubscriptionStateObject(name, state) {
  const icon = getStateIcon(state);
  return {
    name,
    state,
    icon,
    label: `${name} ${icon}`,
  };
}

module.exports = {
  create: () => {
    const emitter = new EventEmitter();
    const subscriptionStates = {};
    return {
      errorHandler(params) {
        const state = STATE.ERROR;
        const icon = getStateIcon(state);
        const statusUpdate = {
          global: {
            state,
            icon,
          },
        };
        if (params.subscription) {
          const subscription = params.subscription;
          subscriptionStates[subscription] = state;
          statusUpdate.subscriptions = [
            getSubscriptionStateObject(subscription, state),
          ];
        }
        emitter.emit(UPDATE_EVENT_NAME, statusUpdate);
      },
      stateUpdateHandler(params) {
        const subscription = params.subscription;
        const state = getState(params.state);
        subscriptionStates[subscription] = state;
        const decoratedSubScriptionStates = Object.keys(subscriptionStates).map(
          (sub) => {
            const subscriptionState = subscriptionStates[sub];
            return getSubscriptionStateObject(sub, subscriptionState);
          }
        );
        const globalState = getGlobalState(subscriptionStates);
        const statusUpdate = {
          global: {
            state: globalState,
            icon: getStateIcon(globalState),
          },
          subscriptions: decoratedSubScriptionStates,
        };
        emitter.emit(UPDATE_EVENT_NAME, statusUpdate);
      },
      emitter,
      UPDATE_EVENT_NAME,
    };
  },
};
