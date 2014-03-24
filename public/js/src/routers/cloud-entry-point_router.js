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
  App.Routers.CloudEntryPoint = Backbone.Router.extend({
    routes: {
      "cloud_entry_points": "index",
      "cloud_entry_points/new": "new",
      "cloud_entry_points/:id": "show",
      "cloud_entry_points/:id/edit": "edit",
    },
    index: function() {
      new App.Views.CloudEntryPointIndex();
    },
    show: function(id) {
      new App.Views.CloudEntryPointShow({id: id});
    },
    edit: function(id) {
      new App.Views.CloudEntryPointEdit({id: id});
    },
    new: function() {
      new App.Views.CloudEntryPointNew();
    }
  });
})();
