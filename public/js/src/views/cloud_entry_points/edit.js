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
  App.Views.CloudEntryPointEdit = Backbone.ValidatableView.extend({
    events: {
      "click #save": "save",
      "blur input,select": "Backbone.ValidatableView.blur"
    },

    template: JST['cloud_entry_points/edit'],

    initialize: function(options) {
      this.model = new App.Models.CloudEntryPoint({id: options.id});

      this.collection = new App.Collections.Infrastructures();

      this._super();

      this.wait(this.model.fetch(), this.collection.fetch());

      this.$el.on('change', 'select#infrastructure_id', this.onchange);
    },

    onload: function() {
      this.listenTo(this.model, "sync", this.render);
    },

    render: function() {
      this.$el.html(this.template({"cloud_entry_point": this.model.attributes, "infrastructures": this.collection.models}));
      this.$('select').val(this.model.get('infrastructure').id);

      var driver = this.model.get('infrastructure').driver;
      this.$('tr.driver').hide();
      this.$('tr.' + driver).show();
    },

    onchange: function() {
      this.$('tr.driver').hide();

      var id = this.$('select#infrastructure_id').val();
      var infrastructure = this.collection.get(id);
      if(infrastructure && infrastructure.get('driver')) {
        this.model.set('infrastructure', infrastructure.attributes);

        var driver = infrastructure.get('driver');
        this.$('tr.' + driver).show();

        this.$('#key').val('');
        this.$('#secret').val('');

        this.$('#tenant').val('');
        this.$('#user').val('');
        this.$('#password').val('');
      }
    },

    save: function() {
      var self = this;
      var infrastructure = this.collection.get(this.$("#infrastructure_id").val());

      this.model.set("name",this.$("#name").val());
      this.model.set("secret",this.$("#secret").val());

      if(infrastructure) {
        if(infrastructure.get('driver') === 'ec2') {
          this.model.set("key",this.$("#key").val());
          this.model.set("secret",this.$("#secret").val());
        }
        if(infrastructure.get('driver') === 'openstack') {
          this.model.set("tenant",this.$("#tenant").val());
          this.model.set("user",this.$("#user").val());
          this.model.set("password",this.$("#password").val());
        }

        this.model.set("infrastructure_id", infrastructure.get('id'));
        this.model.set("infrastructure", infrastructure.attributes);
      }
      this.model.set("entry_point",this.$("#entry_point").val());
      this.model.set("proxy_url",this.$("#proxy_url").val());
      this.model.set("proxy_user",this.$("#proxy_user").val());
      this.model.set("proxy_password",this.$("#proxy_password").val());
      this.model.set("no_proxy",this.$("#no_proxy").val());

      //  Backbone.Model#saveが失敗時にDeferredを返さないので事前チェック
      if(!this.model.isValid(true)) {
        return;
      }

      this.wait(this.model.save()).done(function() {
        Backbone.history.navigate("cloud_entry_points/" + self.model.id, { trigger: true });
      });
    }
  });
})();
