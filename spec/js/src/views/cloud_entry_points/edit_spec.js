describe("CloudEntryPointEdit", function() {
  beforeEach(function() {
    Helper.spyOnFetch(Backbone.Collection.prototype, function() {
      for(var i=1; i<=4; i++) {
        var infrastructure = new Backbone.Model();
        infrastructure.set("id", i);
        infrastructure.set("name", "dummy_infrastructure_id_" + i);
        infrastructure.set("driver", ["ec2", "openstack"][(i + 1) % 2]);
        this.push(infrastructure);
      }
    });
  });

  describe("driverがec2の場合", function() {
    beforeEach(function() {
      Helper.spyOnFetch(App.Models.CloudEntryPoint.prototype, function() {
        this.set("id", 1);
        this.set("name", "dummy_name");
        this.set("key", "dummy_key");
        this.set("secret", "dummy_secret");
        this.set("infrastructure", { id: 1, name: 'dummy_infrastructure_id_1', driver: 'ec2'});
        this.set("entry_point", "dummy_entry_point");
        this.set("proxy_url", "dummy_proxy_url");
        this.set("proxy_user", "dummy_proxy_user");
        this.set("proxy_password", "dummy_proxy_password");
        this.set("no_proxy", "dummy_no_proxy");
        this.set("create_date", "2013/01/01");
        this.set("update_date", "2014/01/01");
      });

      this.page = new App.Views.CloudEntryPointEdit({id: 1});
    });

    describe("#render", function() {
      it("は与えられたモデルの内容を正しくテーブルに表示する", function() {
        expect(this.page.$("table tbody tr td input:visible").length).toEqual(9);

        expect(this.page.$("table tbody tr td input:visible")[0].value).toEqual("1");
        expect(this.page.$("#infrastructure_id option:selected").text()).toEqual("dummy_infrastructure_id_1");
        expect(this.page.$("table tbody tr td input:visible")[1].value).toEqual("dummy_entry_point");
        expect(this.page.$("table tbody tr td input:visible")[2].value).toEqual("dummy_name");
        expect(this.page.$("table tbody tr td input:visible")[3].value).toEqual("dummy_key");
        expect(this.page.$("table tbody tr td input:visible")[4].value).toEqual("dummy_secret");
        expect(this.page.$("table tbody tr td input:visible")[5].value).toEqual("dummy_proxy_url");
        expect(this.page.$("table tbody tr td input:visible")[6].value).toEqual("dummy_proxy_user");
        expect(this.page.$("table tbody tr td input:visible")[7].value).toEqual("dummy_proxy_password");
        expect(this.page.$("table tbody tr td input:visible")[8].value).toEqual("dummy_no_proxy");
      });
    });

    describe("change select#infrastructure_id", function() {
      it("は選択されたDriverに応じて画面上の表示をOpenStack向けに切り替える", function() {
        this.page.$("#infrastructure_id").val(2).change();
        expect(this.page.$("table tbody tr td input:visible").length).toEqual(10);

        expect(this.page.$("table tbody tr td input:visible")[3].value).toEqual("");
        expect(this.page.$("table tbody tr td input:visible")[4].value).toEqual("");
        expect(this.page.$("table tbody tr td input:visible")[5].value).toEqual("");
      });
    });

    describe("click #save(正常系)", function() {
      it("は画面の情報を元にModelを生成する", function() {
        var cloudEntryPoint = this.page.model;
        spyOn(cloudEntryPoint, "save").andCallFake(function() { return new $.Deferred().resolve(); });

        this.page.$("#infrastructure_id").val(3);
        this.page.$("#entry_point").val('dummy_entry_point2');
        this.page.$("#name").val("dummy_name2");
        this.page.$("#key").val("dummy_key2");
        this.page.$("#secret").val("dummy_secret2");
        this.page.$("#proxy_url").val("dummy_proxy_url2");
        this.page.$("#proxy_user").val("dummy_proxy_user2");
        this.page.$("#proxy_password").val("dummy_proxy_password2");
        this.page.$("#no_proxy").val("dummy_no_proxy2");
        this.page.$("#save").click();

        expect(cloudEntryPoint.get("infrastructure_id")).toEqual(3);
        expect(cloudEntryPoint.get("entry_point")).toEqual("dummy_entry_point2");
        expect(cloudEntryPoint.get("name")).toEqual("dummy_name2");
        expect(cloudEntryPoint.get("key")).toEqual("dummy_key2");
        expect(cloudEntryPoint.get("secret")).toEqual("dummy_secret2");
        expect(cloudEntryPoint.get("proxy_url")).toEqual("dummy_proxy_url2");
        expect(cloudEntryPoint.get("proxy_user")).toEqual("dummy_proxy_user2");
        expect(cloudEntryPoint.get("proxy_password")).toEqual("dummy_proxy_password2");
        expect(cloudEntryPoint.get("no_proxy")).toEqual("dummy_no_proxy2");
      });
    });

  });

  describe("driverがopenstackの場合", function() {
    beforeEach(function() {
      Helper.spyOnFetch(App.Models.CloudEntryPoint.prototype, function() {
        this.set("id", 1);
        this.set("name", "dummy_name");
        this.set("tenant", "dummy_tenant");
        this.set("user", "dummy_user");
        this.set("secret", "dummy_secret");
        this.set("infrastructure", { id: 2, name: 'dummy_infrastructure_id_2', driver: 'openstack'});
        this.set("entry_point", "dummy_entry_point");
        this.set("proxy_url", "dummy_proxy_url");
        this.set("proxy_user", "dummy_proxy_user");
        this.set("proxy_password", "dummy_proxy_password");
        this.set("no_proxy", "dummy_no_proxy");
        this.set("create_date", "2013/01/01");
        this.set("update_date", "2014/01/01");
      });

      this.page = new App.Views.CloudEntryPointEdit({id: 1});
    });
    describe("#render", function() {
      it("は与えられたモデルの内容を正しくテーブルに表示する", function() {
        expect(this.page.$("table tbody tr td input:visible").length).toEqual(10);

        expect(this.page.$("table tbody tr td input:visible")[0].value).toEqual("1");
        expect(this.page.$("#infrastructure_id option:selected").text()).toEqual("dummy_infrastructure_id_2");
        expect(this.page.$("table tbody tr td input:visible")[1].value).toEqual("dummy_entry_point");
        expect(this.page.$("table tbody tr td input:visible")[2].value).toEqual("dummy_name");
        expect(this.page.$("table tbody tr td input:visible")[3].value).toEqual("dummy_tenant");
        expect(this.page.$("table tbody tr td input:visible")[4].value).toEqual("dummy_user");
        expect(this.page.$("table tbody tr td input:visible")[5].value).toEqual("dummy_secret");
        expect(this.page.$("table tbody tr td input:visible")[6].value).toEqual("dummy_proxy_url");
        expect(this.page.$("table tbody tr td input:visible")[7].value).toEqual("dummy_proxy_user");
        expect(this.page.$("table tbody tr td input:visible")[8].value).toEqual("dummy_proxy_password");
        expect(this.page.$("table tbody tr td input:visible")[9].value).toEqual("dummy_no_proxy");
      });
    });

    describe("change select#infrastructure_id", function() {
      it("は選択されたDriverに応じて画面上の表示をAWS向けに切り替える", function() {
        this.page.$("#infrastructure_id").val(1).change();
        expect(this.page.$("table tbody tr td input:visible").length).toEqual(9);

        expect(this.page.$("table tbody tr td input:visible")[3].value).toEqual("");
        expect(this.page.$("table tbody tr td input:visible")[4].value).toEqual("");
      });
    });

    describe("click #save(正常系)", function() {
      it("は画面の情報を元にModelを生成する", function() {
        var cloudEntryPoint = this.page.model;
        spyOn(cloudEntryPoint, "save").andCallFake(function() { return new $.Deferred().resolve(); });

        this.page.$("#infrastructure_id").val(4);
        this.page.$("#name").val("dummy_name2");
        this.page.$("#tenant").val("dummy_tenant2");
        this.page.$("#user").val("dummy_user2");
        this.page.$("#password").val("dummy_password2");
        this.page.$("#proxy_url").val("dummy_proxy_url2");
        this.page.$("#proxy_user").val("dummy_proxy_user2");
        this.page.$("#proxy_password").val("dummy_proxy_password2");
        this.page.$("#no_proxy").val("dummy_no_proxy2");
        this.page.$("#save").click();

        expect(cloudEntryPoint.get("infrastructure_id")).toEqual(4);
        expect(cloudEntryPoint.get("name")).toEqual("dummy_name2");
        expect(cloudEntryPoint.get("tenant")).toEqual("dummy_tenant2");
        expect(cloudEntryPoint.get("user")).toEqual("dummy_user2");
        expect(cloudEntryPoint.get("password")).toEqual("dummy_password2");
        expect(cloudEntryPoint.get("proxy_url")).toEqual("dummy_proxy_url2");
        expect(cloudEntryPoint.get("proxy_user")).toEqual("dummy_proxy_user2");
        expect(cloudEntryPoint.get("proxy_password")).toEqual("dummy_proxy_password2");
        expect(cloudEntryPoint.get("no_proxy")).toEqual("dummy_no_proxy2");
      });
    });
  });

  describe("共通", function() {
    beforeEach(function() {
      spyOn(Backbone.history, "navigate").andCallFake(function() {});

      Helper.spyOnFetch(App.Models.CloudEntryPoint.prototype, function() {
        this.set("id", 1);
        this.set("name", "dummy_name");
        this.set("key", "dummy_key");
        this.set("secret", "dummy_secret");
        this.set("infrastructure_id", 1);
        this.set("infrastructure", { id: 1, name: 'dummy_infrastructure_id_1', driver: 'ec2'});
        this.set("proxy_url", "dummy_proxy_url");
        this.set("proxy_user", "dummy_proxy_user");
        this.set("proxy_password", "dummy_proxy_password");
        this.set("no_proxy", "dummy_no_proxy");
        this.set("create_date", "2013/01/01");
        this.set("update_date", "2014/01/01");
      });

      this.page = new App.Views.CloudEntryPointEdit({id: 1});
    });

    describe("blur input", function() {
      it("はフォーカスが外れた場所に入力エラーを設定する", function() {
        this.page.$("#name").val("");

        this.page.$("input#name").trigger("blur");
        expect(this.page.$("input#name").hasClass("invalid")).toBeTruthy();
      });

      it("はフォーカスが外れた場所の入力エラーを解除する", function() {
        var cloudEntryPoint = this.page.model;
        cloudEntryPoint.set("name", "");
        cloudEntryPoint.validate();

        expect(this.page.$("input#name").hasClass("invalid")).toBeTruthy();

        this.page.$("input#name").val("user1");
        this.page.$("input#name").trigger("blur");
        expect(this.page.$("input#name").hasClass("invalid")).toBeFalsy();
      });

      it("はエラーが発生した場所にtooltipを追加する", function() {
        this.page.$("#name").val("");

        this.page.$("input#name").trigger("blur");
        this.page.$("input#name").trigger("mouseover");
        expect(this.page.$("input#name").next(".tooltip").text()).toEqual("Name is required");
      });

      it("はエラーが解除された場所のtooltipを削除する", function() {
        this.page.$("#name").val("");

        this.page.$("input#name").trigger("blur");
        this.page.$("input#name").trigger("mouseover");
        expect(this.page.$("input#name").next(".tooltip").text()).toEqual("Name is required");

        this.page.$("#name").val("user1");
        this.page.$("input#name").trigger("blur");
        expect(this.page.$("input#name").next(".tooltip").length).toEqual(0);
      });
    });

    describe("click #save(正常系)", function() {
      beforeEach(function() {
        this.cloudEntryPoint = this.page.model;
        spyOn(this.cloudEntryPoint, "save").andCallFake(function() { return new $.Deferred().resolve(); });

        this.page.$("#infrastructure_id").val(1);
        this.page.$("#description").val("dummy_description");
        this.page.$("#password").val("dummy_password");
      });

      it("はModel#saveを呼び出す", function() {
        this.page.$("#save").click();

        expect(this.cloudEntryPoint.save).toHaveBeenCalled();
      });

      it("はModel#save完了時に詳細画面に遷移する", function() {
        this.page.$("#save").click();

        expect(Backbone.history.navigate).toHaveBeenCalledWith("cloud_entry_points/1", { trigger : true });
      });

      it("は画面の情報を元にModelを生成する", function() {
        this.page.$("#save").click();
        expect(this.cloudEntryPoint.get("infrastructure_id")).toEqual(1);
        expect(this.cloudEntryPoint.get("name")).toEqual("dummy_name");
        expect(this.cloudEntryPoint.get("key")).toEqual("dummy_key");
        expect(this.cloudEntryPoint.get("secret")).toEqual("dummy_secret");
        expect(this.cloudEntryPoint.get("proxy_url")).toEqual("dummy_proxy_url");
        expect(this.cloudEntryPoint.get("proxy_user")).toEqual("dummy_proxy_user");
        expect(this.cloudEntryPoint.get("no_proxy")).toEqual("dummy_no_proxy");
      });

      it("は入力エラーがあった場合、Model#saveを呼び出さない", function() {
        this.page.$("#name").val("");
        this.page.$("#save").click();

        expect(this.cloudEntryPoint.save).not.toHaveBeenCalled();
      });

      it("は入力エラーがあった場合、入力欄をerror用表示に切り替える", function() {
        this.page.$("#name").val("");
        this.page.$("#save").click();

        expect(this.page.$("input#name").hasClass("invalid")).toBeTruthy();
      });
    });

    describe("click #save(異常系)", function() {
      beforeEach(function() {
        this.cloudEntryPoint = this.page.model;
        spyOn(this.cloudEntryPoint, "save").andCallFake(function() {
          var response = {};
          response.result = "error";
          response.message = "予期せぬエラーが発生しました。";

          var jq = {};
          jq.status = 500;
          jq.responseText = JSON.stringify(response);

          return new $.Deferred().reject(jq);
        });
      });

      it("はサーバ側でエラーが発生した場合にエラーを表示する", function() {
        this.page.$("#save").click();

        expect(this.page.errors.length).toEqual(1);
        expect(this.page.$(".alert-danger").length).toEqual(1);
      });
    });

    describe(".activity-indicator", function() {
      beforeEach(function() {
        spyOn($.prototype, "fadeIn");
        spyOn($.prototype, "fadeOut");

        this.clock = sinon.useFakeTimers();

        var cloudEntryPoint = this.page.model;
        var dfo = new $.Deferred();
        spyOn(cloudEntryPoint, "save").andCallFake(function() { return dfo; });

        this.dfo = dfo;
      });

      afterEach(function() {
        this.clock.restore();
      });

      it("は400ms以上掛かる場合に表示され、遅延処理が成功した時点で非表示にする", function() {
        this.page.$("#save").click();

        this.clock.tick(399);
        expect($.prototype.fadeIn).not.toHaveBeenCalled();
        this.clock.tick(1);
        expect($.prototype.fadeIn).toHaveBeenCalled();

        expect($.prototype.fadeOut).not.toHaveBeenCalled();
        this.dfo.resolve();
        expect($.prototype.fadeOut).toHaveBeenCalled();
      });
    });
  });
});
