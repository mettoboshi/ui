describe("CloudEntryPointIndex", function() {
  beforeEach(function() {
    Helper.spyOnFetch(App.Collections.CloudEntryPoints.prototype, function() {
      this.firstPage = 1;
      this.currentPage = 1;
      this.totalPages = 1;

      for(var i=0; i<3; i++) {
        var drivers = ['ec2', 'openstack'];

        var cloudEntryPoint = new App.Models.CloudEntryPoint();
        cloudEntryPoint.set("id", i);
        cloudEntryPoint.set("name", "dummy_name");
        cloudEntryPoint.set("key", "dummy_key");
        cloudEntryPoint.set("secret", "dummy_secret");
        cloudEntryPoint.set("infrastructure_id", i + 1);
        cloudEntryPoint.set("infrastructure", { name: 'dummy_infrastructure_name', driver: drivers[i % 2]});
        cloudEntryPoint.set("proxy_url", "dummy_proxy_url");
        cloudEntryPoint.set("proxy_user", "dummy_proxy_user");
        cloudEntryPoint.set("proxy_password", "dummy_proxy_password");
        cloudEntryPoint.set("no_proxy", "dummy_no_proxy");
        cloudEntryPoint.set("create_date", "2013/01/01");
        cloudEntryPoint.set("update_date", "2014/01/01");
        this.push(cloudEntryPoint);
      }
    });

    this.page = new App.Views.CloudEntryPointIndex();
  });

  describe("#render", function() {
    it("は与えられたコレクションの件数分DOMにtrタグを追加する", function() {
      expect(this.page.$("tbody > tr").length).toEqual(3);
    });

    it("は与えられたコレクションの内容を正しくテーブルに表示する", function() {
      expect(this.page.$("table tbody tr:first-child td").eq(1).text()).toEqual("dummy_name");
      expect(this.page.$("table tbody tr:first-child td").eq(2).text()).toEqual("dummy_infrastructure_name");
      expect(this.page.$("table tbody tr:first-child td").eq(3).text()).toEqual("2013/01/01");
    });

    it("は最初のページの場合、前ページへのリンクを無効化する", function() {
      var cloudEntryPoints = this.page.cloudEntryPoints;
      cloudEntryPoints.firstPage = 1;
      cloudEntryPoints.currentPage = 1;
      cloudEntryPoints.totalPages = 1;
      cloudEntryPoints.trigger("sync", cloudEntryPoints);

      expect(this.page.$(".pagination > li:first").hasClass("disabled")).toBeTruthy();
    });

    it("は前ページが存在する場合、前ページへのリンクを有効化する", function() {
      var cloudEntryPoints = this.page.cloudEntryPoints;
      cloudEntryPoints.firstPage = 1;
      cloudEntryPoints.currentPage = 2;
      cloudEntryPoints.totalPages = 2;
      cloudEntryPoints.trigger("sync", cloudEntryPoints);

      expect(this.page.$(".pagination > li:first").hasClass("disabled")).toBeFalsy();
    });

    it("は最後のページの場合、次ページへのリンクを無効化する", function() {
      var cloudEntryPoints = this.page.cloudEntryPoints;
      cloudEntryPoints.firstPage = 1;
      cloudEntryPoints.currentPage = 5;
      cloudEntryPoints.totalPages = 5;
      cloudEntryPoints.trigger("sync", cloudEntryPoints);

      expect(this.page.$(".pagination > li:last").hasClass("disabled")).toBeTruthy();
    });

    it("は次ページが存在する場合、次ページへのリンクを有効化する", function() {
      var cloudEntryPoints = this.page.cloudEntryPoints;
      cloudEntryPoints.firstPage = 1;
      cloudEntryPoints.currentPage = 4;
      cloudEntryPoints.totalPages = 5;
      cloudEntryPoints.trigger("sync", cloudEntryPoints);

      expect(this.page.$(".pagination > li:last").hasClass("disabled")).toBeFalsy();
    });
  });

  describe("click .prevPage", function() {
    it("はcloudEntryPoints#prevPageを呼ぶ", function() {
      var cloudEntryPoints = this.page.cloudEntryPoints;
      cloudEntryPoints.firstPage = 1;
      cloudEntryPoints.currentPage = 4;
      cloudEntryPoints.totalPages = 5;
      spyOn(cloudEntryPoints, 'prevPage').andCallFake(function() {});

      cloudEntryPoints.trigger("sync", cloudEntryPoints);

      this.page.$(".prevPage").click();
      expect(cloudEntryPoints.prevPage).toHaveBeenCalled();
    });
  });

  describe("click .nextPage", function() {
    it("はcloudEntryPoints#nextPageを呼ぶ", function() {
      var cloudEntryPoints = this.page.cloudEntryPoints;
      cloudEntryPoints.firstPage = 1;
      cloudEntryPoints.currentPage = 4;
      cloudEntryPoints.totalPages = 5;
      spyOn(cloudEntryPoints, 'nextPage').andCallFake(function() {});

      cloudEntryPoints.trigger("sync", cloudEntryPoints);

      this.page.$(".nextPage").click();
      expect(cloudEntryPoints.nextPage).toHaveBeenCalled();
    });
  });

  describe("click .goTo", function() {
    it("は押されたページを引数としてcloudEntryPoints#goToを呼ぶ", function() {
      var cloudEntryPoints = this.page.cloudEntryPoints;
      cloudEntryPoints.firstPage = 1;
      cloudEntryPoints.currentPage = 1;
      cloudEntryPoints.totalPages = 5;
      spyOn(cloudEntryPoints, 'goTo').andCallFake(function() {});

      cloudEntryPoints.trigger("sync", cloudEntryPoints);

      this.page.$(".goTo").eq(2).click();
      expect(cloudEntryPoints.goTo).toHaveBeenCalledWith('3');
    });
  });
});
