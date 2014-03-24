describe("SystemsIndex", function() {
  beforeEach(function() {
    Helper.spyOnFetch(App.Collections.Systems.prototype, function() {
      this.firstPage = 1;
      this.currentPage = 1;
      this.totalPages = 1;

      for(var i = 1; i < 4; i++) {
        var system = new App.Models.System();
        system.set("id", i);
        system.set("name", "dummyName" + i);
        system.set("template_name", "dummyTemplateName" + i);
        if(i % 2 === 1) {
          system.set("status", { type: "CREATING", message: null });
        } else {
          system.set("status", { type: "ERROR", message: "Error Occured" });
        }
        system.set("create_date", "2013/10/1" + i);
        this.push(system);
      }
    });

    spyOn(window, "setTimeout").andCallFake(function() {});

    this.page = new App.Views.SystemsIndex();
  });

  describe("#render", function() {
    it("は与えられたコレクションの件数分DOMにtrタグを追加する", function() {
      expect(this.page.$("tbody > tr").length).toEqual(3);
    });

    it("は与えられたコレクションの内容を正しくテーブルに表示する", function() {
      expect(this.page.$("table tbody tr:first-child td").eq(0).text()).toEqual("dummyName1");
      expect(this.page.$("table tbody tr:first-child td").eq(1).text()).toEqual("dummyTemplateName1");
      expect(this.page.$("table tbody tr:first-child td").eq(2).text()).toEqual("CREATING");
      expect(this.page.$("table tbody tr:first-child td").eq(3).text()).toEqual("2013/10/11");
    });

    it("はstatusのmessageが存在しない場合アイコンを表示しない", function() {
      var $status = this.page.$("table tbody tr").eq(0).children().eq(2);
      expect($status.find(".glyphicon-exclamation-sign").length).toEqual(0);
    });

    it("はstatusのmessageが存在する場合アイコンを表示する", function() {
      var $status = this.page.$("table tbody tr").eq(1).children().eq(2);
      expect($status.find(".glyphicon-exclamation-sign").length).toEqual(1);
    });
  });
});
