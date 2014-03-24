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

  //  Backbone-validationの有効化
  _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);
  Backbone.Validation.configure({
    selector: "id"
  });

  //  Backbone.Viewを拡張して入力チェックが可能なViewを作成
  Backbone.ValidatableView = Backbone.ExtendedView.extend({
    initialize: function() {
      this._super();
      Backbone.Validation.bind(this, { valid: this.__valid, invalid: this.__invalid });
    },

    "Backbone.ValidatableView.blur": function(e) {
      var key = e.target.id;
      var value = $(e.target).val();

      this.model.set(key, value);

      var attrs = {};
      attrs[key] = value;
      this.model.validate(attrs);
    },

    __valid: function(view, attr, selector) {
      var target = view.$('[' + selector + '~="' + attr + '"]');

      target.next("div.tooltip").remove();
      target.tooltip('destroy');
      Backbone.Validation.callbacks.valid.apply(this, [view, attr, selector]);
    },

    __invalid: function(view, attr, error, selector) {
      var target = view.$('[' + selector + '~="' + attr + '"]');

      target.tooltip('destroy');
      target.tooltip({ title: error });
      Backbone.Validation.callbacks.invalid.apply(this, [view, attr, error, selector]);
    }
  });
})();
