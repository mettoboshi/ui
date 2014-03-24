describe("SystemsShow", function() {
  beforeEach(function() {
    Helper.spyOnFetch(App.Models.System.prototype, function() {
      var xml = "<root><nodes><node id='web_a' name='Web A'></node><node id='web_b' name='Web B'></node><node id='ap_a' name='AP A'></node><node id='ap_b' name='AP B'></node><node id='database' name='Database'></node></nodes><relationals><relational source='web_a' target='ap_a' /><relational source='web_a' target='ap_b' /><relational source='web_b' target='ap_a' /><relational source='web_b' target='ap_b' /><relational source='ap_a' target='database' /><relational source='ap_b' target='database' /></relationals><positions><position id='web_a' x='100' y='200'></position><position id='web_b' x='250' y='200'></position><position id='ap_a' x='100' y='280'></position><position id='ap_b' x='250' y='280'></position><position id='database' x='175' y='360'></position></positions></root>";
      this.set("id", "test");
      this.set("name", "name");
      this.set("template_xml", xml);
      this.set("templateName", "templateName");
      this.set("status", "test");
      this.set("createDate", "2013/10/10");
    });

    this.page = new App.Views.SystemsShow({id: 1});
  });
});
