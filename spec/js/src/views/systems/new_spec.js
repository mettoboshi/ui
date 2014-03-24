describe("SystemsNew", function() {
  beforeEach(function() {
    this.xml = '';
    this.xml += '<?xml version="1.0" encoding="UTF-8" ?>';
    this.xml += '<cc:System xmlns:cc="http://cloudconductor.org/namespaces/cc">';
    this.xml += '  <cc:Name>3層モデルのサンプル2</cc:Name>';
    this.xml += '  <cc:Description>これはサンプルデータです1</cc:Description>';
    this.xml += '  <cc:Author>竹澤1</cc:Author>';
    this.xml += '  <cc:Date>2014-01-20</cc:Date>';
    this.xml += '  <cc:License>MIT</cc:License>';
    this.xml += '  <cc:Infrastructures>';
    this.xml += '    <cc:Infrastructure id="infra1">';
    this.xml += '      <cc:Name>Infra1</cc:Name>';
    this.xml += '    </cc:Infrastructure>';
    this.xml += '  </cc:Infrastructures>';
    this.xml += '</cc:System>';

    this.metaXml = '';
    this.metaXml += '<?xml version="1.0" encoding="UTF-8" ?>';
    this.metaXml += '<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
    this.metaXml += '</ccm:Editor>';

    var self = this;
    Helper.spyOnFetch(App.Models.Template.prototype, function() {
      this.set("id", 1);
      this.set("name", "name");
      this.set("description", "description");
      this.set("remarks", "remarks");

      this.set("adapter", "github");
      this.set("owner", "owner");
      this.set("repository", "repository");
      this.set("revision", "master");
      this.set("path", "path.xml");

      this.set("xml", self.xml);
      this.set("meta_xml", self.metaXml);
    });

    Helper.spyOnFetch(App.Collections.CloudEntryPoints.prototype, function() {
      for(var i=1; i<4; i++) {
        var cloudEntryPoint = new App.Models.CloudEntryPoint();
        cloudEntryPoint.set("id", i);
        cloudEntryPoint.set("name", "dummy_name" + i);
        this.push(cloudEntryPoint);
      }
    });

    this.page = new App.Views.SystemsNew({ id: 1 });
  });

  describe("#render", function() {
    it("はXMLを元に画面を表示する", function() {
      expect(this.page.editor.graph.getElements().length).toEqual(1);
    });
  });

  describe("#startBuild", function() {
    beforeEach(function() {
      this.server = sinon.fakeServer.create();
    });

    afterEach(function() {
      this.server.restore();
    });

    it("はサーバ側へPOSTリクエストを送信する", function() {
      this.page.startBuild();

      var request = _.last(this.server.requests);
      expect(request.method).toEqual("POST");
      expect(request.url).toEqual("systems");
    });

    it("はXMLを送信する", function() {
      this.page.startBuild();

      var request = _.last(this.server.requests);
      var parameters = JSON.parse(request.requestBody);
      expect(parameters.template_xml).toEqual(this.xml);
      expect(parameters.meta_xml).toEqual(this.metaXml);
    });

    it("はXMLのURLを送信する", function() {
      this.page.startBuild();

      var request = _.last(this.server.requests);
      var parameters = JSON.parse(request.requestBody);
      expect(parameters.template_xml_uri).toEqual('https://raw.github.com/owner/repository/master/path.xml');
    });

    it("はUserParametersの情報を送信する", function() {
      var userParameters = this.page.editor.userParameters.collection;
      userParameters.at(0).set('value', 'dummy_name');
      userParameters.at(1).set('value', 'dummy_description');
      userParameters.push(new Backbone.Model({ type: 'machineGroup', key: 'dummy_mg1', value: 'value_mg1' }));
      userParameters.push(new Backbone.Model({ type: 'machineGroup', key: 'dummy_mg2', value: 'value_mg2' }));
      userParameters.push(new Backbone.Model({ type: 'role', key: 'dummy_role1', value: 'value_role1' }));
      userParameters.push(new Backbone.Model({ type: 'role', key: 'dummy_role2', value: 'value_role2' }));
      this.page.startBuild();

      var request = _.last(this.server.requests);
      var parameters = JSON.parse(request.requestBody);
      expect(parameters.user_input_keys.name).toEqual("dummy_name");
      expect(parameters.user_input_keys.description).toEqual("dummy_description");

      expect(parameters.user_input_keys.machine_groups.dummy_mg1).toEqual("value_mg1");
      expect(parameters.user_input_keys.machine_groups.dummy_mg2).toEqual("value_mg2");

      expect(parameters.user_input_keys.roles.dummy_role1).toEqual("value_role1");
      expect(parameters.user_input_keys.roles.dummy_role2).toEqual("value_role2");
    });
  });
});
