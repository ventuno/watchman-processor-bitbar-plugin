const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const utils = require('../watchman-processor-listener/utils');

describe('watchman-processor-listener utils', function() {
  it('should create an instance', function() {
    const inst = utils.create();
    expect(inst).to.be.an('object');
    expect(inst).to.have.property('errorHandler');
    expect(inst).to.have.property('stateUpdateHandler');
    expect(inst).to.have.property('emitter');
    expect(inst).to.have.property('UPDATE_EVENT_NAME');
  });
  describe('watchman-processor-listener utils errorHandler', function() {
    it('should emit update event if errorHandler is called without subscription', function() {
      const inst = utils.create();
      const emit = sinon.spy();
      inst.emitter.emit = emit;

      inst.errorHandler({});
      expect(emit.calledOnce).to.be.true;
      expect(emit.getCall(0).args).to.have.length(2);
      expect(emit.getCall(0).args[0]).to.equal(inst.UPDATE_EVENT_NAME);
      expect(emit.getCall(0).args[1]).to.deep.equal({
        global: {
          icon: '💀',
          state: 'error',
        },
      });
    });
    it('should emit update event if errorHandler is called with subscription', function() {
      const inst = utils.create();
      const emit = sinon.spy();
      inst.emitter.emit = emit;

      inst.errorHandler({subscription: 'example1'});
      expect(emit.calledOnce).to.be.true;
      expect(emit.getCall(0).args).to.have.length(2);
      expect(emit.getCall(0).args[0]).to.equal(inst.UPDATE_EVENT_NAME);
      expect(emit.getCall(0).args[1]).to.deep.equal({
        global: {
          icon: '💀',
          state: 'error',
        },
        subscriptions: [
          {
            name: 'example1',
            label: 'example1 💀',
            icon: '💀',
            state: 'error',
          },
        ],
      });
    });
  });
  describe('watchman-processor-listener utils stateUpdateHandler', function() {
    it('should emit update event when stateUpdateHandler is called state=error', testOneSubscription('error', '💀', 'example1 💀'));
    it('should emit update event when stateUpdateHandler is called state=running', testOneSubscription('running', '🏃', 'example1 🏃'));
    it('should emit update event when stateUpdateHandler is called state=good', testOneSubscription('good', '👍', 'example1 👍'));
  });
  describe('watchman-processor-listener utils stateUpdateHandler multi subscriptions', function() {
    it('should emit update event when stateUpdateHandler is called state=good', testMultipleSubscriptions({
      icon1: '👍',
      state1: 'good',
      icon2: '👍',
      state2: 'good',
      subscriptionLabel1: 'example1 👍',
      subscriptionLabel2: 'example2 👍',
      globalState: 'good',
      globalIcon: '👍',
    }));
    it('should emit update event when stateUpdateHandler is called state=good/running', testMultipleSubscriptions({
      icon1: '🏃',
      state1: 'running',
      icon2: '👍',
      state2: 'good',
      subscriptionLabel1: 'example1 🏃',
      subscriptionLabel2: 'example2 👍',
      globalState: 'running',
      globalIcon: '🏃',
    }));
    it('should emit update event when stateUpdateHandler is called state=error/good', testMultipleSubscriptions({
      icon1: '💀',
      state1: 'error',
      icon2: '👍',
      state2: 'good',
      subscriptionLabel1: 'example1 💀',
      subscriptionLabel2: 'example2 👍',
      globalState: 'error',
      globalIcon: '💀',
    }));
    it('should emit update event when stateUpdateHandler is called state=error/running', testMultipleSubscriptions({
      icon1: '💀',
      state1: 'error',
      icon2: '🏃',
      state2: 'running',
      subscriptionLabel1: 'example1 💀',
      subscriptionLabel2: 'example2 🏃',
      globalState: 'running',
      globalIcon: '🏃',
    }));
  });
  describe('watchman-processor-listener utils stateUpdateHandler unknown states', function() {
    it('should emit update event when stateUpdateHandler is called state=?', function() {
      const inst = utils.create();
      const emit = sinon.spy();
      inst.emitter.emit = emit;

    inst.stateUpdateHandler({
      state: 'notastate',
      subscription: 'example1',
    });
    expect(emit.calledOnce).to.be.true;
    expect(emit.getCall(0).args).to.have.length(2);
    expect(emit.getCall(0).args[0]).to.equal(inst.UPDATE_EVENT_NAME);
    expect(emit.getCall(0).args[1]).to.deep.equal({
      global: {
        icon: '⁉',
        state: 'unknown',
      },
      subscriptions: [
        {
          name: 'example1',
          label: 'example1 ⁉',
          icon: '⁉',
          state: 'unknown',
        },
      ],
    });
    });
  });
});

/**
 * Create a test for the one-subscription scenario
 * @param {STATE} state - Expected state
 * @param {string} icon - Expected icon
 * @param {string} subscriptionLabel - Expected subscription label
 * @return {Function}
 */
function testOneSubscription(state, icon, subscriptionLabel) {
  return () => {
    const inst = utils.create();
    const emit = sinon.spy();
    inst.emitter.emit = emit;

    inst.stateUpdateHandler({
      state,
      subscription: 'example1',
    });
    expect(emit.calledOnce).to.be.true;
    expect(emit.getCall(0).args).to.have.length(2);
    expect(emit.getCall(0).args[0]).to.equal(inst.UPDATE_EVENT_NAME);
    expect(emit.getCall(0).args[1]).to.deep.equal({
      global: {
        icon,
        state,
      },
      subscriptions: [
        {
          name: 'example1',
          label: subscriptionLabel,
          icon,
          state,
        },
      ],
    });
  };
}

/**
 * Create a test for the one-subscription scenario
 * @param {STATE} state1 - Expected state for the first subscription
 * @param {STATE} state2 - Expected state for the second subscription
 * @param {string} icon1 - Expected icon for the first subscription
 * @param {string} icon2 - Expected icon for the second subscription
 * @param {string} subscriptionLabel1 - Expected label for the first subscription
 * @param {string} subscriptionLabel2 - Expected label for the second subscription
 * @param {STATE} globalState - Expected global state
 * @param {string} globalIcon - Expected global icon
 * @return {Function}
 */
function testMultipleSubscriptions({state1, icon1, state2, icon2, subscriptionLabel1, subscriptionLabel2, globalState, globalIcon}) {
  return () => {
    const inst = utils.create();
    const emit = sinon.spy();
    inst.emitter.emit = emit;

    inst.stateUpdateHandler({
      state: state1,
      subscription: 'example1',
    });
    inst.stateUpdateHandler({
      state: state2,
      subscription: 'example2',
    });
    expect(emit.calledTwice).to.be.true;
    expect(emit.getCall(1).args).to.have.length(2);
    expect(emit.getCall(1).args[0]).to.equal(inst.UPDATE_EVENT_NAME);
    expect(emit.getCall(1).args[1]).to.deep.equal({
      global: {
        icon: globalIcon,
        state: globalState,
      },
      subscriptions: [
        {
          name: 'example1',
          label: subscriptionLabel1,
          icon: icon1,
          state: state1,
        },
        {
          name: 'example2',
          label: subscriptionLabel2,
          icon: icon2,
          state: state2,
        },
      ],
    });
  };
}
