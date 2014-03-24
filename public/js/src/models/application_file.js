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
  App.Models.ApplicationFile = Backbone.Model.extend({
    defaults: {
    },

    initialize: function(attributes, options) {
      this.system_id = options.system_id;
      this.application_id = options.application_id;
    },

    urlRoot: function() {
      return "systems/" + this.system_id + "/applications/" + this.application_id + "/application_files";
    },

    destroy: function() {
      if(this.isNew()) {
        return new $.Deferred().resolve();
      }
      return Backbone.Model.prototype.destroy.apply(this, arguments);
    }
  });
})();

