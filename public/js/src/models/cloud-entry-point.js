// Copyright 2014 TIS inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
(function() {
  "use strict";
  App.Models.CloudEntryPoint = Backbone.Model.extend({
    defaults: {
    },
    validation: {
      infrastructure_id: { required: true },
      entry_point: { required: true },
      name: { required: true },
      tenant: { required: function() { return this.isDriver('openstack'); } },
      user: { required: function() { return this.isDriver('openstack'); } },
      password: { required: function() { return this.isDriver('openstack'); } },
      key: { required: function() { return this.isDriver('ec2'); } },
      secret: { required: function() { return this.isDriver('ec2'); } },
    },
    urlRoot: 'cloud_entry_points',
    parse: function(json) {
      var infrastructure = json.infrastructure;
      if(infrastructure && infrastructure.driver === 'openstack') {
        var values = json.key.split('+');
        json.tenant = values[0];
        json.user = values[1];
        json.key = '';
      }
      return json;
    },

    toJSON: function() {
      var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
      var infrastructure = json.infrastructure;
      if(infrastructure && infrastructure.driver === 'openstack') {
        json.key = json.tenant + '+' + json.user;
        json.secret = json.password;
      }
      delete json.tenant;
      delete json.user;
      delete json.infrastructure;
      delete json.password;
      return json;
    },

    isDriver: function(driver) {
      return this.get('infrastructure') && this.get('infrastructure').driver === driver;
    }
  });
})();
