describe("Template", function() {
  describe("adapterがgithubの場合", function() {
    describe("#xmlUrl", function() {
      it("はowner, repository, path, revisionからURLを生成して返す", function() {
        var template = new App.Models.Template();
        template.set('adapter', 'github');
        template.set('owner', 'owner');
        template.set('repository', 'repository');
        template.set('revision', 'master');
        template.set('path', 'path.xml');

        expect(template.xmlUrl()).toEqual('https://raw.github.com/owner/repository/master/path.xml');
      });
    });
  });

  describe("adapterが未実装のadapterの場合", function() {
    describe("#xmlUrl", function() {
      it("は例外を発生させる", function() {
        var template = new App.Models.Template();
        expect(template.xmlUrl).toThrow();
      });
    });
  });
});
