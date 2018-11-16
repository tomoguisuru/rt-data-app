import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend({
  reactiveData: service('reactive-data'),

  beforeModel(model) {
    // TODO: Update to join specific room
    get(this, 'reactiveData').listen('1');
  }
});
