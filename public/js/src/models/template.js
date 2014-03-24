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
  App.Models.Template = Backbone.Model.extend({
    defaults: {
    },
    urlRoot: "templates",
    xmlUrl: function() {
      if(this.get('adapter') !== 'github') {
        throw this.get('adapter') + " adapter is does not implemented";
      }

      var owner = this.get('owner');
      var repository = this.get('repository');
      var path = this.get('path');
      var revision = this.get('revision');

      return "https://raw.github.com/" + owner + "/" + repository + "/" + revision + "/" + path;
    }
  });
})();
