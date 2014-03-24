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
  App.Views.SystemsDeploy = Backbone.ExtendedView.extend({
    events: {
      'click .checkbox': 'toggle',
      'click .toggleAll': 'toggleAll',
      'click #add': 'add',
      'click #delete': 'delete',
      'click #save': 'save',
      'click #deploy': 'deploy',
    },

    pageTemplate: JST['systems/deploy'],
    itemTemplate: JST['systems/_deploy_item'],

    initialize: function(options) {
      this._super();
      _.bindAll(this);

      this.system_id = options.id;

      this.model = new App.Models.System({id: options.id});

      this.machineGroups = new App.Collections.MachineGroups([], { system_id: this.system_id });
      this.applications = new App.Collections.Applications([], { system_id: this.system_id });

      var preRequirements = $.when(this.model.fetch(), this.machineGroups.fetch());

      this.wait(preRequirements.then(this.fetchApplication).then(this.fetchApplicationFiles));
    },

    fetchApplication: function() {
      var options = { system_id: this.system_id };
      return this.applications.fetch(options).then(_.bind(function() {
        if(this.applications.length === 0) {
          var application = new App.Models.Application({}, options);
          this.applications.push(application);
          return application.save();
        }
        return new $.Deferred().resolve();
      }, this));
    },

    fetchApplicationFiles: function() {
      var options = { system_id: this.system_id, application_id: _.first(this.applications.models).get('id') };
      this.collection = new App.Collections.ApplicationFiles([], options);
      return this.collection.fetch(options);
    },

    onload: function() {
      this.$el.on('change', '.deploy-target select', this.onchange);
      this.refresh();
    },

    render: function() {
      this.$el.html(this.pageTemplate(this.model.attributes));
      this.collection.each(this.appendItem);
    },

    appendItem: function(application_file) {
      var row = $(this.itemTemplate({ "application_file": application_file, "machine_groups": this.machineGroups }));
      if(application_file.get('machine_group')) {
        row.find('.deploy-target select').val(application_file.get('machine_group').id);
      }
      this.$('#deploy_items').append(row);
    },

    toggleAll: function() {
      if (this.$(".toggleAll").prop('checked')) {
        this.$(".checkbox").prop("checked", true);
        this.$("#delete").removeAttr("disabled");
      } else {
        this.$(".checkbox").prop("checked", false);
        this.$("#delete").attr("disabled", "disabled");
      }
    },

    toggle: function() {
      var checkedStates = _.map(this.$(".checkbox"), function(checkbox) { return $(checkbox).prop('checked'); });
      var allFlag = _.all(checkedStates);
      var zeroFlag = _.any(checkedStates);

      this.$(".toggleAll").prop("checked", allFlag);

      if(zeroFlag) {
        this.$("#delete").removeAttr("disabled");
      } else {
        this.$("#delete").attr("disabled", "disabled");
      }
    },

    onchange: function(e) {
      var target = $(e.target);
      var cid = target.parents('tr').data('cid');
      var model = this.collection.get(cid);

      if(target.attr('name') === "machine_group_id") {
        var mg = _.find(this.machineGroups.models, function(mg) { return mg.get("id") === parseInt(target.val()); });
        if(mg) {
          model.set("machine_group", mg.attributes);
        } else {
          model.set("machine_group", undefined);
        }
      }
      model.set(target.attr('name'), target.val());
    },

    add: function() {
      var options = { system_id: this.system_id, application_id: _.first(this.applications.models).get('id') };
      var application_file = new App.Models.ApplicationFile({}, options);
      this.collection.push(application_file);
      this.appendItem(application_file);
    },

    delete: function() {
      var requests = _.map(this.$("tbody :checkbox:checked"), function(checkbox) {
        var tr = $(checkbox).parents('tr');
        var model = this.collection.get(tr.data('cid'));
        return model.destroy().done(_.bind(function() {
          this.collection.remove(tr.data('cid'));
          tr.remove();
          this.$("#delete").attr("disabled", "disabled");
        }, this));
      }, this);

      $.when.apply(this, requests).done(_.bind(function() {
        this.$(":checkbox:checked").removeAttr('checked');
      }, this));
    },

    save: function(e) {
      var tr = $(e.target).parents('tr');
      var applicationFile = this.collection.get(tr.data('cid'));

      var options = {};
      options.iframe = true;
      options.files = tr.find(':file');
      options.data = applicationFile.attributes;
      applicationFile.save({}, options).done(function(attributes) {
        tr.find('select').attr('disabled', 'disabled');
        tr.find('#save').remove();
        tr.find('input:file').replaceWith($('<span>').text(attributes.name));
      });
    },

    deploy: function() {
      var self = this;
      this.wait(_.first(self.applications.models).deploy().done(function() {
        self.refresh();
      }));
    },

    refresh: function() {
      var self = this;
      this.applications.fetch().done(function() {
        var state = self.applications.models[0].get("state");
        if(state === "NOT YET") { return; }

        self.errors = [];
        if(state === "DEPLOYING") {
          self.errors.push({ type: "info", title: "Information", message: i18n.t("system.deploy.progress") });
          self.render();
          self.$(".deploy-save .btn, #add, #deploy, .checkbox, .toggleAll").attr("disabled", "disabled");
          setTimeout(self.refresh, 10000);
        } else {
          if(state === "SUCCESS") {
            self.errors.push({ type: "success", title: "Success", message: i18n.t("system.deploy.success") });
          } else { //  state === "ERROR"
            self.errors.push({ type: "danger", title: "Error", message: i18n.t("system.deploy.error") });
          }
          self.render();
          self.$(".deploy-save .btn, #add, #deploy, .checkbox, .toggleAll").removeAttr("disabled");
        }
      }).fail(function() {
        console.error("An error occurred while deploying.");
        console.error(arguments);
      });
    }
  });
})();
