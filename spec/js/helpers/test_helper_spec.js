describe("console", function() {
  describe(".log", function() {
    it("は循環参照しているオブジェクトを出力する場合も例外を出さない", function() {
      var parent = {};
      var child = {};

      child.parent = parent;
      parent.child = child;
      console.log(parent);
    });

    it("はnullを引数にした場合も例外を出さない", function() {
      console.log(null);
    });

    it("はundefinedを引数にした場合も例外を出さない", function() {
      console.log(undefined);
    });
  });
});
