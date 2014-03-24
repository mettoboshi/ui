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
  App.Views.SystemsNew = Backbone.ExtendedView.extend({
    events: {
      "click #start_build": "startBuild"
    },
    template: JST['systems/new'],

    initialize: function(options) {
      this._super();

      this.components = [];
      this.templateModel = new App.Models.Template({ id: options.id });
      this.model = new App.Models.System();
      this.cloudEntryPoints = new App.Collections.CloudEntryPoints();
      this.cloudEntryPoints.perPage = null;
      this.cloudEntryPoints.currentPage = null;
      this.wait(this.templateModel.fetch(), this.cloudEntryPoints.fetch());
    },

    onload: function() {
      var main = new App.Components.Main({ readonly: true });
      var parser = new App.Editors.Converters.XMLParser(main);
      this.editor = parser.parse(this.templateModel.get('xml'), this.templateModel.get('meta_xml'));

      main.addComponent(this.editor.toolbox);
      main.addComponent(this.editor.detail);
      main.addComponent(this.editor.xmlViewer);
      main.addComponent(this.editor.middlewares);
      main.addComponent(this.editor.roles);
      main.addComponent(this.editor.property);
      main.addComponent(this.editor.userParameters);
      this.editor.cloudEntryPoints.cloudEntryPoints = this.cloudEntryPoints;
      main.addComponent(this.editor.cloudEntryPoints);

      var header = new App.Components.Header({ readonly: true, provisioningonly: true }, this.editor);

      this.addComponent(header);
      this.addComponent(new App.Components.Footer({}, this.editor));

      this.addComponent(main);
      this.render();

      main.deselectAll();

      this.customizeHeader(header);

      this.editor.xmlViewer.setXml(this.templateModel.get('xml'));
    },

    addComponent: function(component) {
      this.components.push(component);
    },

    render: function() {
      this.$el.html(this.template());

      //  登録済みComponentを全て描画する
      _.each(this.components, function(component) {
        this.$(".editor").append(component.$el);
        component.render();
      }, this);
    },

    customizeHeader: function(header) {
      var backButton = $("<li />").addClass("button glyphicon glyphicon-arrow-left");
      backButton.attr('title', i18n.t("common.button.back"));
      backButton.on('click', this.back);
      header.$(".right").prepend(backButton);

      var buildButton = $("<li />").addClass("button glyphicon glyphicon-play");
      buildButton.attr('title', i18n.t("common.button.start_build"));
      buildButton.on('click', this.startBuild);
      header.$(".right").prepend(buildButton);
    },

    back: function() {
      Backbone.history.navigate('templates', { trigger: true, replace: true });
    },

    startBuild: function() {
      this.model.set('template_xml', this.templateModel.get('xml'));
      this.model.set('meta_xml', this.templateModel.get('meta_xml'));
      this.model.set('template_xml_uri', this.templateModel.xmlUrl());

      var userInputKeys = {
        machine_groups: {},
        roles: {}
      };
      _.each(this.editor.userParameters.collection.models, function(model) {
        if(model.get('type') === 'machineGroup') {
          userInputKeys['machine_groups'][model.get('key')] = model.get('value');
        } else if(model.get('type') === 'role') {
          userInputKeys['roles'][model.get('key')] = model.get('value');
        } else {
          userInputKeys[model.get('key')] = model.get('value');
        }
      });

      var cloudEntryPoints = {};
      _.each(this.editor.cloudEntryPoints.collection, function(elem) {
        cloudEntryPoints[elem.infrastructure.get('infrastructure_id')] = elem.cloud_entry_point_id;
      });

      this.model.set('user_input_keys', userInputKeys);
      this.model.set('cloud_entry_points', cloudEntryPoints);
      this.wait(this.model.save()).done(function() {
        Backbone.history.navigate("systems", { trigger: true, replace: false });
      });
    }
  });
})();
