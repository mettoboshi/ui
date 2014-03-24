describe("CloudEntryPointShow", function() {
  describe("driverがec2の場合", function() {
    describe("#render", function() {
      it("は与えられたモデルの内容を正しくテーブルに表示する", function() {
        Helper.spyOnFetch(App.Models.CloudEntryPoint.prototype, function() {
          this.set("id", 1);
          this.set("name", "dummy_name");
          this.set("key", "dummy_key");
          this.set("secret", "dummy_secret");
          this.set("infrastructure", { id: '1', name: 'dummy_aws', driver: 'ec2'});
          this.set("entry_point", "dummy_entry_point");
          this.set("proxy_url", "dummy_proxy_url");
          this.set("proxy_user", "dummy_proxy_user");
          this.set("proxy_password", "dummy_proxy_password");
          this.set("no_proxy", "dummy_no_proxy");
          this.set("create_date", "2013/01/01");
          this.set("update_date", "2014/01/01");
        });

        this.page = new App.Views.CloudEntryPointShow({id: 1});

        expect(this.page.$("table tbody tr").eq(0).find("td").next().text()).toEqual("1");
        expect(this.page.$("table tbody tr").eq(1).find("td").next().text()).toEqual("dummy_aws");
        expect(this.page.$("table tbody tr").eq(2).find("td").next().text()).toEqual("dummy_entry_point");
        expect(this.page.$("table tbody tr").eq(3).find("td").next().text()).toEqual("dummy_name");
        expect(this.page.$("table tbody tr").eq(4).find("td").next().text()).toEqual("dummy_key");
        expect(this.page.$("table tbody tr").eq(5).find("td").next().text()).toEqual("********");
        expect(this.page.$("table tbody tr").eq(6).find("td").next().text()).toEqual("dummy_proxy_url");
        expect(this.page.$("table tbody tr").eq(7).find("td").next().text()).toEqual("dummy_proxy_user");
        expect(this.page.$("table tbody tr").eq(8).find("td").next().text()).toEqual("********");
        expect(this.page.$("table tbody tr").eq(9).find("td").next().text()).toEqual("dummy_no_proxy");
      });
    });
  });

  describe("driverがopenstackの場合", function() {
    describe("#render", function() {
      it("は与えられたモデルの内容を正しくテーブルに表示する", function() {
        Helper.spyOnFetch(App.Models.CloudEntryPoint.prototype, function() {
          this.set("id", 1);
          this.set("name", "dummy_name");
          this.set("tenant", "dummy_tenant");
          this.set("user", "dummy_user");
          this.set("secret", "dummy_secret");
          this.set("infrastructure", { name: 'dummy_openstack', driver: 'openstack'});
          this.set("entry_point", "dummy_entry_point");
          this.set("proxy_url", "dummy_proxy_url");
          this.set("proxy_user", "dummy_proxy_user");
          this.set("proxy_password", "dummy_proxy_password");
          this.set("no_proxy", "dummy_no_proxy");
          this.set("create_date", "2013/01/01");
          this.set("update_date", "2014/01/01");
        });

        this.page = new App.Views.CloudEntryPointShow({id: 1});

        expect(this.page.$("table tbody tr").eq(0).find("td").next().text()).toEqual("1");
        expect(this.page.$("table tbody tr").eq(1).find("td").next().text()).toEqual("dummy_openstack");
        expect(this.page.$("table tbody tr").eq(2).find("td").next().text()).toEqual("dummy_entry_point");
        expect(this.page.$("table tbody tr").eq(3).find("td").next().text()).toEqual("dummy_name");
        expect(this.page.$("table tbody tr").eq(4).find("td").next().text()).toEqual("dummy_tenant");
        expect(this.page.$("table tbody tr").eq(5).find("td").next().text()).toEqual("dummy_user");
        expect(this.page.$("table tbody tr").eq(6).find("td").next().text()).toEqual("********");
        expect(this.page.$("table tbody tr").eq(7).find("td").next().text()).toEqual("dummy_proxy_url");
        expect(this.page.$("table tbody tr").eq(8).find("td").next().text()).toEqual("dummy_proxy_user");
        expect(this.page.$("table tbody tr").eq(9).find("td").next().text()).toEqual("********");
        expect(this.page.$("table tbody tr").eq(10).find("td").next().text()).toEqual("dummy_no_proxy");
      });
    });
  });
});
