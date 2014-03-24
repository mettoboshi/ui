describe("GraphRenderer", function() {
  beforeEach(function() {
    this.xml = '';
    this.xml += '<root>';
    this.xml += '  <nodes>';
    this.xml += '    <node id="web_a" name="Web A"></node>';
    this.xml += '    <node id="web_b" name="Web B"></node>';
    this.xml += '    <node id="ap_a" name="AP A"></node>';
    this.xml += '    <node id="ap_b" name="AP B"></node>';
    this.xml += '    <node id="database" name="Database"></node>';
    this.xml += '  </nodes>';
    this.xml += '  <relationals>';
    this.xml += '    <relational source="web_a" target="ap_a" />';
    this.xml += '    <relational source="web_a" target="ap_b" />';
    this.xml += '    <relational source="web_b" target="ap_a" />';
    this.xml += '    <relational source="web_b" target="ap_b" />';
    this.xml += '    <relational source="ap_a" target="database" />';
    this.xml += '    <relational source="ap_b" target="database" />';
    this.xml += '  </relationals>';
    this.xml += '  <positions>';
    this.xml += '    <position id="web_a" x="100" y="200"></position>';
    this.xml += '    <position id="web_b" x="250" y="200"></position>';
    this.xml += '    <position id="ap_a" x="100" y="280"></position>';
    this.xml += '    <position id="ap_b" x="250" y="280"></position>';
    this.xml += '    <position id="database" x="175" y="360"></position>';
    this.xml += '  </positions>';
    this.xml += '</root>';
  
    this.target = $("<div>");

    this.renderer = new App.Helpers.GraphRenderer(this.xml, this.target);
    this.renderer.render();
  });
  describe("#render", function() {
    it("は与えられたXMLのnode要素に応じた数のrectを作成する", function() {
      expect(this.target.find("svg").length).toEqual(1);
      expect(this.target.find("rect").length).toEqual(5);
    });

    it("は与えられたXMLのnameに応じてtextを作成する", function() {
      var webB = this.target.find(".Rect").eq(1);
      expect(webB.find("text").text()).toEqual("Web B");
    });

    it("は与えられたXMLのpositionに応じてRect要素の場所を決定する", function() {
      var webB = this.target.find(".Rect").eq(1);
      expect(webB.attr("transform")).toEqual("translate(250,200)");
    });

    it("は与えられたXMLのrelational要素に応じた数のlinkを作成する", function() {
      expect(this.target.find("svg").length).toEqual(1);
      expect(this.target.find("g.link").length).toEqual(6);
    });

    it("は与えられたXMLのnode要素が持つ属性をmodelに保存する", function() {
      var nodes = this.renderer.getNodes();
      expect(_.values(nodes).length).toEqual(5);

      var parameters = nodes.web_a.get("parameters");
      expect(_.keys(parameters).length).toEqual(2);
      expect(_.keys(parameters)).toContain("id", "name");

      expect(_.values(parameters).length).toEqual(2);
      expect(_.values(parameters)).toContain("web_a", "Web A");
    });
  });

  describe("#update", function() {
    it("は与えられたXMLでネットワーク図を更新する", function() {
      var newXml = '';
      newXml += '<root>';
      newXml += '  <nodes>';
      newXml += '    <node id="test" name="Test" />';
      newXml += '  </nodes>';
      newXml += '  <relationals>';
      newXml += '  <relationals>';
      newXml += '<root>';
      this.renderer.update(newXml);
      expect(this.target.find("svg").length).toEqual(1);
      expect(this.target.find("rect").length).toEqual(1);
      expect(this.target.find("g.link").length).toEqual(0);
    });
  });
});

