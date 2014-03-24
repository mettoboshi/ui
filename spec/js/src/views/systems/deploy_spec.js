describe("SystemsDeploy", function() {
  var applicationState = "NOT YET";

  setMachineGroupsDummyData = function(mgs) {
    for(var i = 1; i < 4; i++) {
      var mg = new Backbone.Model();
      mg.set("id", i);
      mg.set("name", "dummy_name" + i);
      mgs.push(mg);
    }
  };

  setApplicationsDummyData = function(applications) {
    applications.reset();
    applications.firstPage = 1;
    applications.currentPage = 1;
    applications.totalPages = 1;

    var application = new App.Models.Application({}, { system_id: 1 });
    application.set("id", 1);
    application.set("state", applicationState);
    applications.push(application);
  };

  setApplicationFilesDummyData = function(files) {
    for(var i=1; i<4; i++) {
      var file = new App.Models.ApplicationFile({}, { system_id: 1, application_id: 1 });
      file.set("id", i);
      file.set("machine_group_id", i);
      file.set("name", "dummy_file_name");
      files.push(file);
    }
  };

  beforeEach(function() {
    spyOn(window, "setTimeout").andCallFake(function() {});
  });

  describe("#initialize", function() {
    it("はApplicationが既にある場合、必要なAPIを順番に呼び出す", function() {
      var system = new $.Deferred();
      var machineGroups = new $.Deferred();
      var applications = new $.Deferred();
      var files = new $.Deferred();
      spyOn(App.Models.System.prototype, 'fetch').andCallFake(function() { return system; });
      spyOn(App.Collections.MachineGroups.prototype, 'fetch').andCallFake(function() { return machineGroups; });
      spyOn(App.Collections.Applications.prototype, 'fetch').andCallFake(function() {
        setApplicationsDummyData(this);
        return applications;
      });
      spyOn(App.Collections.ApplicationFiles.prototype, 'fetch').andCallFake(function() { return files; });
      spyOn(App.Views.SystemsDeploy.prototype, 'onload').andCallFake(function() {});

      expect(App.Models.System.prototype.fetch).not.toHaveBeenCalled();
      expect(App.Collections.MachineGroups.prototype.fetch).not.toHaveBeenCalled();
      new App.Views.SystemsDeploy({ id: 1 });
      expect(App.Models.System.prototype.fetch).toHaveBeenCalled();
      expect(App.Collections.MachineGroups.prototype.fetch).toHaveBeenCalled();

      expect(App.Collections.Applications.prototype.fetch).not.toHaveBeenCalled();
      system.resolve();
      expect(App.Collections.Applications.prototype.fetch).not.toHaveBeenCalled();
      machineGroups.resolve();
      expect(App.Collections.Applications.prototype.fetch).toHaveBeenCalled();

      expect(App.Collections.ApplicationFiles.prototype.fetch).not.toHaveBeenCalled();
      applications.resolve();
      expect(App.Collections.ApplicationFiles.prototype.fetch).toHaveBeenCalled();

      expect(App.Views.SystemsDeploy.prototype.onload).not.toHaveBeenCalled();
      files.resolve();
      expect(App.Views.SystemsDeploy.prototype.onload).toHaveBeenCalled();
    });

    it("はApplicationが無い場合、必要なAPIを順番に呼び出す", function() {
      var system = new $.Deferred();
      var machineGroups = new $.Deferred();
      var applications = new $.Deferred();
      var saveApplication = new $.Deferred();
      var files = new $.Deferred();
      spyOn(App.Models.System.prototype, 'fetch').andCallFake(function() { return system; });
      spyOn(App.Collections.MachineGroups.prototype, 'fetch').andCallFake(function() { return machineGroups; });
      spyOn(App.Collections.Applications.prototype, 'fetch').andCallFake(function() { return applications; });
      spyOn(App.Models.Application.prototype, 'save').andCallFake(function() { return saveApplication; });
      spyOn(App.Collections.ApplicationFiles.prototype, 'fetch').andCallFake(function() { return files; });
      spyOn(App.Views.SystemsDeploy.prototype, 'onload').andCallFake(function() {});

      expect(App.Models.System.prototype.fetch).not.toHaveBeenCalled();
      expect(App.Collections.MachineGroups.prototype.fetch).not.toHaveBeenCalled();
      new App.Views.SystemsDeploy({ id: 1 });
      expect(App.Models.System.prototype.fetch).toHaveBeenCalled();
      expect(App.Collections.MachineGroups.prototype.fetch).toHaveBeenCalled();

      expect(App.Collections.Applications.prototype.fetch).not.toHaveBeenCalled();
      system.resolve();
      expect(App.Collections.Applications.prototype.fetch).not.toHaveBeenCalled();
      machineGroups.resolve();
      expect(App.Collections.Applications.prototype.fetch).toHaveBeenCalled();

      expect(App.Collections.ApplicationFiles.prototype.fetch).not.toHaveBeenCalled();
      applications.resolve();
      expect(App.Collections.ApplicationFiles.prototype.fetch).not.toHaveBeenCalled();
      saveApplication.resolve();
      expect(App.Collections.ApplicationFiles.prototype.fetch).toHaveBeenCalled();

      expect(App.Views.SystemsDeploy.prototype.onload).not.toHaveBeenCalled();
      files.resolve();
      expect(App.Views.SystemsDeploy.prototype.onload).toHaveBeenCalled();
    });
  });

  describe("初期化後", function() {
    beforeEach(function() {
      Helper.spyOnFetch(App.Models.System.prototype, function() {
        this.set("id", "1");
        this.set("name", "dummy_name");
        this.set("template_xml", "dummy_xml");
        this.set("templateName", "dummy_templateName");
        this.set("status", "dummy_status");
        this.set("createDate", "2013/10/10");
      });

      Helper.spyOnFetch(App.Collections.MachineGroups.prototype, function() {
        setMachineGroupsDummyData(this);
      });

      Helper.spyOnFetch(App.Collections.Applications.prototype, function() {
        setApplicationsDummyData(this);
      });

      Helper.spyOnFetch(App.Collections.ApplicationFiles.prototype, function() {
        setApplicationFilesDummyData(this);
      });

      this.page = new App.Views.SystemsDeploy({id: 1});
    });

    describe("#render", function() {
      it("は与えられたコレクションの件数分DOMにtrタグを追加する", function() {
        expect(this.page.$("tbody > tr").length).toEqual(3);
      });

      it("は与えられたコレクションの内容を正しくテーブルに表示する", function() {
        expect(this.page.$("tbody tr:first-child td select option").eq(1).text()).toEqual("dummy_name1");
        expect(this.page.$("tbody tr:first-child td.deploy-file span").text()).toEqual("dummy_file_name");
      });

      it("は与えられたコレクションの内容を元に正しくドロップボックスを作成する", function() {
        expect(this.page.$("select:first").find("option").length).toEqual(4);

        var option = this.page.$("select:first").find("option").eq(1);
        expect(option.prop("value")).toEqual('1');
        expect(option.text()).toEqual("dummy_name1");

        expect(this.page.$("table tbody tr td select").eq(1).find("option").length).toEqual(4);

        option = this.page.$("table tbody tr td select").eq(0).find("option").eq(1);
        expect(option.prop("value")).toEqual("1");
        expect(option.text()).toEqual("dummy_name1");
      });

      it("既存データの場合はドロップボックスを選択不可にする", function() {
        expect(this.page.$("select:disabled").length).toEqual(3);
      });
    });

    describe("click .checkbox", function() {
      it("は個別チェックボックスの状態によって全体チェックボックスを切り替える", function() {
        expect(this.page.$(".toggleAll").prop("checked")).toBeFalsy();

        this.page.$(".checkbox").eq(0).click();
        this.page.$(".checkbox").eq(1).click();
        this.page.$(".checkbox").eq(2).click();

        expect(this.page.$(".toggleAll").prop("checked")).toBeTruthy();

        this.page.$(".checkbox").eq(2).click();

        expect(this.page.$(".toggleAll").prop("checked")).toBeFalsy();
      });

      it("は全体チェックボックスのクリックによって個別チェックボックスを切り替える", function() {
        this.page.$(".checkbox").eq(0).click();

        this.page.$(".toggleAll").eq(0).click();

        expect(this.page.$(".checkbox:checked").length).toEqual(3);

        this.page.$(".toggleAll").eq(0).click();

        expect(this.page.$(".checkbox:checked").length).toEqual(0);
      });

      it("は全体チェックボックスの状態によって削除ボタンの有効無効を切り替える", function() {
        expect(this.page.$("#delete").attr("disabled")).toEqual("disabled");
        this.page.$(".toggleAll").eq(0).click();
        expect(this.page.$("#delete").attr("disabled")).toEqual(undefined);
        this.page.$(".toggleAll").eq(0).click();
        expect(this.page.$("#delete").attr("disabled")).toEqual("disabled");
      });

      it("は個別チェックボックスの状態によって削除ボタンの有効無効を切り替える", function() {
        expect(this.page.$("#delete").attr("disabled")).toEqual("disabled");
        this.page.$(".checkbox").eq(0).click();
        expect(this.page.$("#delete").attr("disabled")).toEqual(undefined);
        this.page.$(".checkbox").eq(0).click();
        expect(this.page.$("#delete").attr("disabled")).toEqual("disabled");
      });
    });

    describe("change .deploy-target select", function() {
      it("は画面上の変更に応じてModelの値を変化させる", function() {
        this.page.$("tr:last .deploy-target select").val(2);
        this.page.$("tr:last .deploy-target select").change();
        var model = _.last(this.page.collection.models);
        expect(model.get('machine_group_id')).toEqual('2');
      });
    });

    describe("click #add", function() {
      it("はCollectionにModelを追加する", function() {
        expect(this.page.collection.models.length).toEqual(3);
        expect(this.page.$("tbody > tr").length).toEqual(3);

        this.page.$("#add").click();

        expect(this.page.collection.models.length).toEqual(4);
        expect(this.page.$("tbody > tr").length).toEqual(4);
      });
    });

    describe("click #delete", function() {
      beforeEach(function() {
        this.server = sinon.fakeServer.create();
      });

      afterEach(function() {
        this.server.restore();
      });

      it("はCollectionのModelを削除する", function() {
        _.each(this.page.collection.models, function(model) {
          spyOn(model, 'destroy').andCallFake(function() { return new $.Deferred().resolve(); });
        });

        expect(this.page.collection.models.length).toEqual(3);
        expect(this.page.$("tbody > tr").length).toEqual(3);

        this.page.$(".checkbox").eq(0).click();
        this.page.$("#delete").click();

        expect(this.page.collection.models.length).toEqual(2);
        expect(this.page.$("tbody > tr").length).toEqual(2);
      });

      it("は既に保存されたModelに対してDELETE用APIを呼び出す", function() {
        this.page.$(".checkbox").eq(1).click();
        this.page.$("#delete").click();

        expect(this.server.requests.length).toEqual(1);

        var request = _.last(this.server.requests);
        expect(request.method).toEqual("DELETE");
        expect(request.url).toEqual("systems/1/applications/1/application_files/2");
      });

      it("は新規行の場合、DELETE用APIを呼び出さない", function() {
        this.page.$("#add").click();
        this.page.$(".checkbox:last").click();

        expect(this.page.collection.models.length).toEqual(4);
        this.page.$("#delete").click();
        expect(this.page.collection.models.length).toEqual(3);
        expect(this.server.requests.length).toEqual(0);
      });

      it("削除レスポンスが返った後に画面、Collectionから削除する", function() {
        var deferred = new $.Deferred();
        spyOn(this.page.collection.models[0], 'destroy').andCallFake(function() { return deferred; });

        this.page.$(".checkbox").eq(0).click();
        this.page.$("#delete").click();

        expect(this.page.collection.models.length).toEqual(3);
        expect(this.page.$("tbody > tr").length).toEqual(3);

        deferred.resolve();

        expect(this.page.collection.models.length).toEqual(2);
        expect(this.page.$("tbody > tr").length).toEqual(2);
      });

      it("全ての削除レスポンスが返った時点でヘッダ部分のチェックボックスをオフにする", function() {
        var deferred1 = new $.Deferred();
        var deferred2 = new $.Deferred();
        var deferred3 = new $.Deferred();
        spyOn(this.page.collection.models[0], 'destroy').andCallFake(function() { return deferred1; });
        spyOn(this.page.collection.models[1], 'destroy').andCallFake(function() { return deferred2; });
        spyOn(this.page.collection.models[2], 'destroy').andCallFake(function() { return deferred3; });

        this.page.$("thead :checkbox").click();
        this.page.$("#delete").click();

        deferred1.resolve();
        deferred2.resolve();

        expect(this.page.$("thead :checkbox:checked").length).toEqual(1);
        deferred3.resolve();
        expect(this.page.$("thead :checkbox:checked").length).toEqual(0);
      });
    });

    describe("click #save", function() {
      it("はPOSTリクエストを送信する", function() {
        //  iframeで分離されるため、テストが記述不可
      });

      it("は入力行を確定する", function() {
        spyOn(App.Models.ApplicationFile.prototype, 'save').andCallFake(function() {
          this.collection.trigger.apply(this.collection, ['sync']);
          return new $.Deferred().resolve({ name: 'dummy_filename' });
        });

        this.page.$("#add").click();
        var tr = this.page.$("#save").parents('tr');

        expect(tr.find('select').attr('disabled')).toBeUndefined();
        expect(tr.find('#save').length).toEqual(1);
        expect(tr.find('input:file').length).toEqual(1);
        this.page.$("#save").click();
        expect(tr.find('select').attr('disabled')).not.toBeUndefined();
        expect(tr.find('#save').length).toEqual(0);
        expect(tr.find('input:file').length).toEqual(0);
        expect(tr.find('.deploy-file span').text()).toEqual('dummy_filename');
      });
    });

    describe("click #deploy", function() {
      beforeEach(function() {
        this.server = sinon.fakeServer.create();
      });

      afterEach(function() {
        this.server.restore();
      });

      it("はシステム詳細画面に遷移する", function() {
        this.page.$("#deploy").click();
        expect(this.server.requests.length).toEqual(1);

        var request = _.last(this.server.requests);
        expect(request.method).toEqual('POST');
        expect(request.url).toEqual('systems/1/applications/1/deploy');
      });
    });

    describe("#refresh", function() {
      beforeEach(function() {
        this.page.$("#add").click();
      });

      it("はstateがNOT YETの場合#delete以外のbuttonとcheckboxを有効にする", function() {
        applicationState = "NOT YET";
        this.page.refresh();

        expect(this.page.$("#delete").attr("disabled")).toBeDefined();
        expect(this.page.$("#add").attr("disabled")).toBeUndefined();
        expect(this.page.$("#deploy").attr("disabled")).toBeUndefined();
        expect(this.page.$(".deploy-save .btn:last").attr("disabled")).toBeUndefined();

        expect(this.page.$(".checkbox[disabled]").length).toEqual(0);
        expect(this.page.$(".toggleAll").attr("disabled")).toBeUndefined();
      });

      it("はstateがNOT YETの場合messageを表示しない", function() {
        applicationState = "NOT YET";
        this.page.refresh();

        expect(this.page.$(".alert-info").length).toEqual(0);
        expect(this.page.$(".alert-success").length).toEqual(0);
        expect(this.page.$(".alert-danger").length).toEqual(0);
      });

      it("はstateがDEPLOYINGの場合buttonとcheckboxを無効にする", function() {
        applicationState = "DEPLOYING";
        this.page.refresh();

        expect(this.page.$("#delete").attr("disabled")).toBeDefined();
        expect(this.page.$("#add").attr("disabled")).toBeDefined();
        expect(this.page.$("#deploy").attr("disabled")).toBeDefined();
        expect(this.page.$(".deploy-save .btn:last").attr("disabled")).toBeDefined();

        expect(this.page.$(".checkbox[disabled]").length).toEqual(4);
        expect(this.page.$(".toggleAll").attr("disabled")).toBeDefined();
      });

      it("はstateがDEPLOYINGの場合messageを表示しない", function() {
        applicationState = "DEPLOYING";
        this.page.refresh();

        expect(this.page.$(".alert-info").length).toEqual(1);
        expect(this.page.$(".alert-success").length).toEqual(0);
        expect(this.page.$(".alert-danger").length).toEqual(0);

        expect(this.page.$(".alert-info span").text()).toEqual(i18n.t("system.deploy.progress"));
      });

      it("はstateがSUCCESSの場合#delete以外のbuttonとcheckboxを有効にする", function() {
        applicationState = "SUCCESS";
        this.page.refresh();

        expect(this.page.$("#delete").attr("disabled")).toBeDefined();
        expect(this.page.$("#add").attr("disabled")).toBeUndefined();
        expect(this.page.$("#deploy").attr("disabled")).toBeUndefined();
        expect(this.page.$(".deploy-save .btn:last").attr("disabled")).toBeUndefined();

        expect(this.page.$(".checkbox[disabled]").length).toEqual(0);
        expect(this.page.$(".toggleAll").attr("disabled")).toBeUndefined();
      });

      it("はstateがSUCCESSの場合messageを表示する", function() {
        applicationState = "SUCCESS";
        this.page.refresh();

        expect(this.page.$(".alert-info").length).toEqual(0);
        expect(this.page.$(".alert-success").length).toEqual(1);
        expect(this.page.$(".alert-danger").length).toEqual(0);

        expect(this.page.$(".alert-success span").text()).toEqual(i18n.t("system.deploy.success"));
      });

      it("はstateがERRORの場合#delete以外のbuttonとcheckboxを有効にする", function() {
        applicationState = "ERROR";
        this.page.refresh();

        expect(this.page.$("#delete").attr("disabled")).toBeDefined();
        expect(this.page.$("#add").attr("disabled")).toBeUndefined();
        expect(this.page.$("#deploy").attr("disabled")).toBeUndefined();
        expect(this.page.$(".deploy-save .btn:last").attr("disabled")).toBeUndefined();

        expect(this.page.$(".checkbox[disabled]").length).toEqual(0);
        expect(this.page.$(".toggleAll").attr("disabled")).toBeUndefined();
      });

      it("はstateがERRORの場合messageを表示する", function() {
        applicationState = "ERROR";
        this.page.refresh();

        expect(this.page.$(".alert-info").length).toEqual(0);
        expect(this.page.$(".alert-success").length).toEqual(0);
        expect(this.page.$(".alert-danger").length).toEqual(1);

        expect(this.page.$(".alert-danger span").text()).toEqual(i18n.t("system.deploy.error"));
      });
    });
  });
});
