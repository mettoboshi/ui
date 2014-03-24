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
(function(){
  "use strict";
  App.Views.SystemsIndex = Backbone.ExtendedView.extend({
    events: {
      "click .prevPage": function() { this.collection.prevPage(); return false; },
      "click .nextPage": function() { this.collection.nextPage(); return false; },
      "click .goTo": function(e) { this.collection.goTo(e.target.innerHTML); return false; }
    },

    pageTemplate: JST['systems/index'],
    itemTemplate: JST['systems/_item'],

    initialize: function() {
      this._super();

      this.collection = new App.Collections.Systems();

      this.wait(this.collection.fetch());
    },

    onload: function() {
      this.listenTo(this.collection, "reset", this.render);
      this.listenTo(this.collection, "sync", this.render);

      //  定期的な更新を開始
      setTimeout(this.refresh, 60000);
    },

    render: function() {
      this.$el.html(this.pageTemplate(this.collection));
      this.collection.each(this.appendItem);
    },

    appendItem: function(system) {
      this.$('#system_items').append(this.itemTemplate(system.attributes));
      if (system.attributes.status === 'error') {
        this.$("#system_items > tbody").children().last().addClass("danger");
      }
    },

    refresh: function() {
      var self = this;
      self.collection.fetch().done(function() {
        self.render();
        if(self.$el.parents("body").length === 1) {
          setTimeout(self.refresh, 600000);
        }
      });
    }
  });
})();

