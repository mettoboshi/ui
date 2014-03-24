describe("TemplatesIndex", function() {
  beforeEach(function() {
    Helper.spyOnFetch(App.Collections.Templates.prototype, function() {
      this.firstPage = 1;
      this.currentPage = 1;
      this.totalPages = 1;

      for(var i=0; i<3; i++) {
        var template = new App.Models.Template();
        template.set("id", i);
        template.set("name", "name");
        template.set("owner", "dummy_owner");
        template.set("description", "description");
        template.set("xml", "xml");
        this.push(template);
      }
    });

    this.page = new App.Views.TemplatesIndex();
  });

  describe("#render", function() {
    it("は与えられたコレクションの件数分DOMにtrタグを追加する", function() {
      expect(this.page.$("tbody > tr").length).toEqual(3);
    });

    it("は与えられたコレクションの内容を正しくテーブルに表示する", function() {
      expect(this.page.$("table tbody tr:first-child td").eq(0).text()).toEqual("0");
      expect(this.page.$("table tbody tr:first-child td").eq(1).text()).toEqual("name");
      expect(this.page.$("table tbody tr:first-child td").eq(2).text()).toEqual("dummy_owner");
      expect(this.page.$("table tbody tr:first-child td").eq(3).text()).toEqual("description");
    });

    it("は最初のページの場合、前ページへのリンクを無効化する", function() {
      var templates = this.page.collection;
      templates.firstPage = 1;
      templates.currentPage = 1;
      templates.totalPages = 1;
      templates.trigger("sync", templates);

      expect(this.page.$(".pagination > li:first").hasClass("disabled")).toBeTruthy();
    });

    it("は前ページが存在する場合、前ページへのリンクを有効化する", function() {
      var templates = this.page.collection;
      templates.firstPage = 1;
      templates.currentPage = 2;
      templates.totalPages = 2;
      templates.trigger("sync", templates);

      expect(this.page.$(".pagination > li:first").hasClass("disabled")).toBeFalsy();
    });

    it("は最後のページの場合、次ページへのリンクを無効化する", function() {
      var templates = this.page.collection;
      templates.firstPage = 1;
      templates.currentPage = 5;
      templates.totalPages = 5;
      templates.trigger("sync", templates);

      expect(this.page.$(".pagination > li:last").hasClass("disabled")).toBeTruthy();
    });

    it("は次ページが存在する場合、次ページへのリンクを有効化する", function() {
      var templates = this.page.collection;
      templates.firstPage = 1;
      templates.currentPage = 4;
      templates.totalPages = 5;
      templates.trigger("sync", templates);

      expect(this.page.$(".pagination > li:last").hasClass("disabled")).toBeFalsy();
    });
  });

  describe("click .prevPage", function() {
    it("はCollection#prevPageを呼ぶ", function() {
      var templates = this.page.collection;
      templates.firstPage = 1;
      templates.currentPage = 4;
      templates.totalPages = 5;
      spyOn(templates, 'prevPage').andCallFake(function() {});

      templates.trigger("sync", templates);

      this.page.$(".prevPage").click();
      expect(templates.prevPage).toHaveBeenCalled();
    });
  });

  describe("click .nextPage", function() {
    it("はCollection#nextPageを呼ぶ", function() {
      var templates = this.page.collection;
      templates.firstPage = 1;
      templates.currentPage = 4;
      templates.totalPages = 5;
      spyOn(templates, 'nextPage').andCallFake(function() {});

      templates.trigger("sync", templates);

      this.page.$(".nextPage").click();
      expect(templates.nextPage).toHaveBeenCalled();
    });
  });

  describe("click .goTo", function() {
    it("は押されたページを引数としてCollection#goToを呼ぶ", function() {
      var templates = this.page.collection;
      templates.firstPage = 1;
      templates.currentPage = 1;
      templates.totalPages = 5;
      spyOn(templates, 'goTo').andCallFake(function() {});

      templates.trigger("sync", templates);

      this.page.$(".goTo").eq(2).click();
      expect(templates.goTo).toHaveBeenCalledWith('3');
    });
  });
});
