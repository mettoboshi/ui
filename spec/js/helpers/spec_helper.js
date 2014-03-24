(function() {
  var Helper = {};

  Helper.spyOnFetch = function(target, func) {
    spyOn(target, "fetch").andCallFake(function() {
      func.apply(this);

      this.trigger("sync", this);
      return new $.Deferred().resolve();
    });
  };

  App.Session = {};
  App.Models.User = Backbone.Model.extend({});

  window.Helper = Helper;
})();
