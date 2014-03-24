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
  App.Views.SystemsShow = Backbone.ExtendedView.extend({
    events: {
    },

    template: JST['systems/show'],

    initialize: function(options) {
      this._super();

      this.components = [];
      this.model = new App.Models.System({id: options.id});
      this.wait(this.model.fetch());
    },

    onload: function() {
      var main = new App.Components.Main({ readonly: true });
      var parser = new App.Editors.Converters.XMLParser(main);
      var editor = parser.parse(this.model.get('template_xml'), this.model.get('meta_xml'));

      main.addComponent(editor.toolbox);
      main.addComponent(editor.detail);
      main.addComponent(editor.xmlViewer);
      main.addComponent(editor.middlewares);
      main.addComponent(editor.roles);
      main.addComponent(editor.property);

      var header = new App.Components.Header({ readonly: true, provisioningonly: false }, editor);

      this.addComponent(header);
      this.addComponent(new App.Components.Footer({}, editor));

      this.addComponent(main);
      this.render();

      main.deselectAll();

      this.customizeHeader(header);

      editor.xmlViewer.setXml(this.model.get('template_xml'));

      this.listenTo(this.model, "sync", this.render);
    },

    addComponent: function(component) {
      this.components.push(component);
    },

    render: function() {
      this.$el.html(this.template(this.model.attributes));

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

      var deployButton = $("<li />").addClass("button glyphicon glyphicon-open");
      deployButton.attr('title', i18n.t("common.button.deploy"));
      deployButton.on('click', this.deploy);
      header.$(".right").prepend(deployButton);
    },

    back: function() {
      Backbone.history.navigate('systems', { trigger: true, replace: true });
    },

    deploy: function() {
      Backbone.history.navigate('systems/' + this.model.id + '/deploy', { trigger: true, replace: true });
    },
  });
})();

