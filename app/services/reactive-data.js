import Service, { inject as service } from '@ember/service';
import { get, setProperties } from '@ember/object';
import { task } from 'ember-concurrency';

export default Service.extend({
  cable: service('cable'),
  store: service('store'),

  listeners: null,
  socket: null,

  init() {
    this._super(...arguments);

    setProperties(this, {
      listeners: [],
      socket: get(this, 'cable').createConsumer('ws://localhost:3200/cable')
    });
  },

  listen(roomId) {
    const listeners = get(this, 'listeners');

    if (listeners.includes(roomId)) { return; }

    listeners.push(roomId);
    const self = this;

    get(this, 'socket').subscriptions.create({
      channel: 'ReactiveDataChannel',
      roomId
    }, {
      received(data) {
        return get(self, 'task__updateData').perform(data);
      }
    });
  },

  task__updateData: task(function* (data) {
    const { action, id, payload, type } = data;
    const store = get(this, 'store');
    const record = store.peekRecord(type, id);
    const json = JSON.parse(payload);
    let promise = null;

    if (action === 'delete' && record) {
      promise = store.unloadRecord(record);
    }

    if (action === 'update' && record) {
      promise = store.pushPayload(json);
    }

    if (action === 'create' && !record) {
      promise = store.pushPayload(json);
    }

    yield promise;
  })
});
