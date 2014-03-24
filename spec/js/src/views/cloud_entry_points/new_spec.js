describe("CloudEntryPointNew", function() {
  beforeEach(function() {
    Helper.spyOnFetch(App.Collections.Infrastructures.prototype, function() {
      for(var i=1; i<=4; i++) {
        var infrastructure = new Backbone.Model();
        infrastructure.set("id", i);
        infrastructure.set("name", "dummy_infrastructure_id_" + i);
        infrastructure.set("driver", ["ec2", "openstack"][(i + 1) % 2]);
        this.push(infrastructure);
      }
    });

    this.page = new App.Views.CloudEntryPointNew();
  });

  describe("#render", function() {
    it("はdriver毎のパラメータを非表示にする", function() {
      expect(this.page.$('input:visible').length).toEqual(6);
    });
  });

  describe("change #infrastructure_id", function() {
    it("は選択されたDriverに応じて画面上の表示をOpenStack向けに切り替える", function() {
      this.page.$('#infrastructure_id').val(2).change();
      expect(this.page.$('input:visible').length).toEqual(9);
    });

    it("は選択されたDriverに応じて画面上の表示をAWS向けに切り替える", function() {
      this.page.$('#infrastructure_id').val(1).change();
      expect(this.page.$('input:visible').length).toEqual(8);
    });
  });

  describe("データ入力済みの場合", function() {
    beforeEach(function() {
      spyOn(Backbone.history, "navigate").andCallFake(function() {});

      this.page.$('#infrastructure_id').val(1).change();
      this.page.$("#name").val("user1");
      this.page.$("#key").val("dummy_key");
      this.page.$("#secret").val("dummy_secret");
      this.page.$("#proxy_url").val("dummy_proxy_url");
      this.page.$("#proxy_user").val("dummy_proxy_user");
      this.page.$("#proxy_password").val("dummy_proxy_password");
      this.page.$("#no_proxy").val("dummy_no_proxy");
      this.page.$("#entry_point").val("dummy_entry_point2");
    });

    describe("blur input", function() {
      it("はフォーカスが外れた場所に入力エラーを設定する", function() {
        this.page.$("input#name").val("");
        this.page.$("input#name").trigger("blur");
        expect(this.page.$("input#name").hasClass("invalid")).toBeTruthy();
      });

      it("はフォーカスが外れた場所の入力エラーを解除する", function() {
        var cloudEntryPoint = this.page.model;
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

    describe("click #save", function() {
      beforeEach(function() {
        this.cloudEntryPoint = this.page.model;
        spyOn(this.cloudEntryPoint, "save").andCallFake(_.bind(function() {
          this.cloudEntryPoint.set("id", 1);
          return new $.Deferred().resolve();
        }, this));
      });

      it("はModel#saveを呼び出す", function() {
        this.page.$("#save").click();

        expect(this.cloudEntryPoint.save).toHaveBeenCalled();
      });

      it("はModel#save完了時に詳細画面に遷移する", function() {
        this.page.$("#save").click();

        expect(Backbone.history.navigate).toHaveBeenCalledWith("cloud_entry_points/1", { trigger : true });
      });

      describe("AWSの場合", function() {
        it("画面の情報を元にOpenStack向けのModelを生成する", function() {
          this.page.$('#infrastructure_id').val(1).change();
          this.page.$('#key').val('dummy_key2');
          this.page.$('#secret').val('dummy_secret2');
          this.page.$("#save").click();

          expect(this.cloudEntryPoint.get("name")).toEqual("user1");
          expect(this.cloudEntryPoint.get("infrastructure_id")).toEqual(1);
          expect(this.cloudEntryPoint.get("entry_point")).toEqual("dummy_entry_point2");
          expect(this.cloudEntryPoint.get("key")).toEqual("dummy_key2");
          expect(this.cloudEntryPoint.get("secret")).toEqual("dummy_secret2");
          expect(this.cloudEntryPoint.get("proxy_url")).toEqual("dummy_proxy_url");
          expect(this.cloudEntryPoint.get("proxy_user")).toEqual("dummy_proxy_user");
          expect(this.cloudEntryPoint.get("proxy_password")).toEqual("dummy_proxy_password");
          expect(this.cloudEntryPoint.get("no_proxy")).toEqual("dummy_no_proxy");
        });
      });

      describe("OpenStackの場合", function() {
        it("画面の情報を元にOpenStack向けのModelを生成する", function() {
          this.page.$('#infrastructure_id').val(2).change();
          this.page.$('#tenant').val('dummy_tenant2');
          this.page.$('#user').val('dummy_user2');
          this.page.$('#password').val('dummy_password2');
          this.page.$("#save").click();

          expect(this.cloudEntryPoint.get("name")).toEqual("user1");
          expect(this.cloudEntryPoint.get("infrastructure_id")).toEqual(2);
          expect(this.cloudEntryPoint.get("entry_point")).toEqual("dummy_entry_point2");
          expect(this.cloudEntryPoint.get("tenant")).toEqual("dummy_tenant2");
          expect(this.cloudEntryPoint.get("user")).toEqual("dummy_user2");
          expect(this.cloudEntryPoint.get("password")).toEqual("dummy_password2");
          expect(this.cloudEntryPoint.get("proxy_url")).toEqual("dummy_proxy_url");
          expect(this.cloudEntryPoint.get("proxy_user")).toEqual("dummy_proxy_user");
          expect(this.cloudEntryPoint.get("proxy_password")).toEqual("dummy_proxy_password");
          expect(this.cloudEntryPoint.get("no_proxy")).toEqual("dummy_no_proxy");
        });
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
  });
});

