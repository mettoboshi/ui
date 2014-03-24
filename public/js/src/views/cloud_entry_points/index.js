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
  App.Views.CloudEntryPointIndex = Backbone.ExtendedView.extend({
    events: {
      "click .prevPage": function() { this.cloudEntryPoints.prevPage(); return false; },
      "click .nextPage": function() { this.cloudEntryPoints.nextPage(); return false; },
      "click .goTo": function(e) { this.cloudEntryPoints.goTo(e.target.innerHTML); return false; }
    },

    pageTemplate: JST['cloud_entry_points/index'],
    itemTemplate: JST['cloud_entry_points/_item'],

    initialize: function() {
      this._super();

      this.cloudEntryPoints = new App.Collections.CloudEntryPoints();

      this.wait(this.cloudEntryPoints.fetch());
    },

    onload: function() {
      this.listenTo(this.cloudEntryPoints, "sync", this.render);
    },

    render: function() {
      this.$el.html(this.pageTemplate(this.cloudEntryPoints));
      this.cloudEntryPoints.each(this.appendItem);
    },

    appendItem: function(cloudEntryPoints) {
      this.$("#cloud_entry_point_items").append(this.itemTemplate(cloudEntryPoints.attributes));
    }
  });
})();
