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

  App.Helpers.GraphRenderer = function(xml, target) {
    if(typeof(xml) === "string") {
      xml = xml.replace(/(^\s+|\s+$)/g, '');
    }

    this.xml = $(xml);
    this.target = target;

    this.graph = new joint.dia.Graph();
    this.update(this.xml);
  };

  App.Helpers.GraphRenderer.prototype.getNodes = function() { return this.nodes; };

  //  描画開始
  App.Helpers.GraphRenderer.prototype.render = function() {

    var paper = new joint.dia.Paper({
      el: $(this.target),
      width: "100%",
      height: "100%",
      gridSize: 10,
      model: this.graph
    });

    this.update(this.xml);

    paper.on('cell:pointerdown', function(v, evt, x, y) {
      v.model.trigger("click", v.model, evt, x, y);
    });
  };


  //  描画対象のXMLを更新
  App.Helpers.GraphRenderer.prototype.update = function(xml) {
    if(typeof(xml) === "string") {
      xml = xml.replace(/(^\s+|\s+$)/g, '');
    }
    this.xml = $(xml);
    var positions = this.xml.find("positions");

    var self = this;
    this.nodes = {};
    this.relationals = [];
    this.xml.find("node").each(function(idx, node) { generateNode(self.nodes, $(node), positions); });
    this.xml.find("relational").each(function(idx, relational) { generateRelational(self.relationals, $(relational), self.nodes); });

    //  refresh papers
    this.graph.clear();
    this.graph.addCells(_.values(this.nodes)).addCells(this.relationals);
  };


  // XMLを元にノードを作成
  function generateNode(nodes, node, positions) {
    var id = node.attr("id");
    var x, y;
    if(id) {
      x = positions.find("#" + id).attr("x");
      y = positions.find("#" + id).attr("y");
    }
    x = x || Math.random() * 400;
    y = y || Math.random() * 400;

    var parameters = {};
    _.each(node.get(0).attributes, function(attribute) {
      parameters[attribute.nodeName] = attribute.nodeValue;
    });

    var rect = new joint.shapes.basic.Rect({
      position: { x: parseInt(x, 10), y: parseInt(y, 10) },
      size: { width: 100, height: 30 },
      attrs: { rect: { fill: 'blue' }, text: { text: node.attr("name"), fill: 'white' } },
      parameters: parameters
    });

    id = id || rect.id;
    nodes[id] = rect;
  }


  // XMLを元にリンクを作成
  function generateRelational(relationals, relational, nodes) {
    var source = relational.attr("source");
    var target = relational.attr("target");

    var link = new joint.dia.Link({
      source: { id: nodes[source].id },
      target: { id: nodes[target].id }
    });

    relationals.push(link);
  }
})();
