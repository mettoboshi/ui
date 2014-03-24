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
  App.Views.CloudEntryPointShow = Backbone.ExtendedView.extend({
    events: {
      "click #delete": "delete"
    },

    template: JST['cloud_entry_points/show'],

    initialize: function(options){
      this._super();
      _.bindAll(this);
      this.cloudEntryPoint = new App.Models.CloudEntryPoint({id: options.id});

      this.wait(this.cloudEntryPoint.fetch());
    },

    onload: function() {
    },

    render: function() {
      this.$el.html(this.template(this.cloudEntryPoint.attributes));
    },

    delete: function() {
      this.cloudEntryPoint.destroy().done(function() {
        Backbone.history.navigate("cloud_entry_points", {trigger: true});
      });
    }

  });
})();
