describe("Extend", function() {

  describe("View", function() {
    describe("#wait", function() {
      it("は与えられた遅延処理が終わったらrenderを呼び出す", function() {
        var page = new Backbone.ExtendedView({tagName: "table", className: "sample"});
        spyOn(page, "render");

        page.wait(new $.Deferred().resolve());
        expect(page.render).toHaveBeenCalled();
      });

      it("は与えられた遅延処理が終わったらonloadを呼び出す", function() {
        $(".__container").children().remove();
        $(".__container").append($("<div>").text("dummy"));

        var page = new Backbone.ExtendedView({tagName: "table", className: "sample"});
        spyOn(page, "onload");

        page.wait(new $.Deferred().resolve());
        expect(page.onload).toHaveBeenCalled();

        expect($(".__container").children("div").length).toEqual(0);
        expect($(".__container").children("table").length).toEqual(1);
      });

      it("はDeferredを返し、与えられた遅延処理が終わったらresolveする", function() {
        var page = new Backbone.ExtendedView({tagName: "table", className: "sample"});

        var doneSpy = jasmine.createSpy("done");
        var failSpy = jasmine.createSpy("fail");
        page.wait(new $.Deferred().resolve()).done(doneSpy).fail(failSpy);

        expect(doneSpy).toHaveBeenCalled();
        expect(failSpy).not.toHaveBeenCalled();
      });

      it("はDeferredを返し、与えられた遅延処理が失敗したらrejectする", function() {
        var page = new Backbone.ExtendedView({tagName: "table", className: "sample"});

        var doneSpy = jasmine.createSpy("done");
        var failSpy = jasmine.createSpy("fail");
        page.wait(new $.Deferred().reject()).done(doneSpy).fail(failSpy);

        expect(doneSpy).not.toHaveBeenCalled();
        expect(failSpy).toHaveBeenCalled();
      });
    });

    describe(".activity-indicator", function() {
      beforeEach(function() {
        spyOn($.prototype, "fadeIn");
        spyOn($.prototype, "fadeOut");

        this.clock = sinon.useFakeTimers();

        var page = new Backbone.ExtendedView({tagName: "table", className: "sample"});
        this.dfo = new $.Deferred();
        page.wait(this.dfo);
      });

      afterEach(function() {
        this.clock.restore();
      });

      it("は400ms以上掛かる場合に表示され、遅延処理が成功した時点で非表示にする", function() {
        this.clock.tick(399);
        expect($.prototype.fadeIn).not.toHaveBeenCalled();
        this.clock.tick(1);
        expect($.prototype.fadeIn).toHaveBeenCalled();

        expect($.prototype.fadeOut).not.toHaveBeenCalled();
        this.dfo.resolve();
        expect($.prototype.fadeOut).toHaveBeenCalled();
      });

      it("は400ms以上掛かる場合に表示され、遅延処理がfailした時点で非表示にする", function() {
        this.clock.tick(399);
        expect($.prototype.fadeIn).not.toHaveBeenCalled();
        this.clock.tick(1);
        expect($.prototype.fadeIn).toHaveBeenCalled();

        expect($.prototype.fadeOut).not.toHaveBeenCalled();
        this.dfo.reject();
        expect($.prototype.fadeOut).toHaveBeenCalled();
      });

      it("は400ms以内にレスポンスが返った場合には表示しない", function() {
        this.clock.tick(399);
        expect($.prototype.fadeIn).not.toHaveBeenCalled();

        this.dfo.resolve();

        this.clock.tick(1);
        expect($.prototype.fadeIn).not.toHaveBeenCalled();
      });

      it("は400ms以内にfailした場合も表示しない", function() {
        this.clock.tick(399);
        expect($.prototype.fadeIn).not.toHaveBeenCalled();

        this.dfo.reject();

        this.clock.tick(1);
        expect($.prototype.fadeIn).not.toHaveBeenCalled();
      });
    });

    describe("#partial", function() {
      it("存在しないテンプレートを指定すると例外を出す", function() {
        var view = new Backbone.ExtendedView();
        expect(function() { view.partial('_not_found', { value: "Sample" }); }).toThrow("Template '_not_found' is not found.");
      });

      it("は別のテンプレートファイルを読み込んで展開する", function() {
        window.JST = window.JST || {};

        /*jshint -W085 */
        window.JST['_partial'] = function(obj){var __p=[];with(obj||{}){__p.push('<div>',(''+ value ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>');}return __p.join('');};

        var view = new Backbone.ExtendedView();
        var partialHtml = view.partial('_partial', { value: "Sample" });

        expect(partialHtml).toEqual("<div>Sample</div>");
      });
    });

    describe("i18n", function() {
      beforeEach(function() {
        this.server = sinon.fakeServer.create();

        var translationJP = { key: "テスト" };
        var translationEN = { key: "Test" };
        this.server.respondWith("locales/ja-JP/translation.json", JSON.stringify(translationJP));
        this.server.respondWith("locales/ja/translation.json", JSON.stringify(translationJP));
        this.server.respondWith("locales/en-US/translation.json", JSON.stringify(translationEN));
        this.server.respondWith("locales/en/translation.json", JSON.stringify(translationEN));

        i18n.init({ debug: false, cookie: false });
        this.server.respond();

        this.SampleView = Backbone.ExtendedView.extend({
          initialize: function() {
            this._super();

            this.wait();
          },
          render: function() {
            this.$el.html("<h2 data-i18n='key'>Sample</h2>");
          },
        });
      });

      afterEach(function() {
        this.server.restore();
      });

      it("日本語設定の場合は日本語のリソースを使用する", function() {
        i18n.setLng("ja", {});
        this.server.respond();

        var page = new this.SampleView();
        expect(page.$("h2").text()).toEqual("テスト");
      });

      it("英語設定の場合は英語のリソースを使用する", function() {
        i18n.setLng("en", {});
        this.server.respond();

        var page = new this.SampleView();
        expect(page.$("h2").text()).toEqual("Test");
      });

      it("再描画した場合も正しいリソースを使用する", function() {
        i18n.setLng("ja", {});
        this.server.respond();

        var page = new this.SampleView();
        page.render();

        expect(page.$("h2").text()).toEqual("テスト");
      });
    });
  });
});
