describe("common/error.jst.ejs", function() {
  beforeEach(function() {
    var SampleView = Backbone.ExtendedView.extend({
      initialize: function() {
        this._super();

        this.wait();
      },
      render: function() {
        this.$el.html(JST['common/error'].apply(this));
      },
    });
    this.page = new SampleView();

    this.page.errors = [];
    this.page.errors.push({ type: "warning", title: "Test", message: "Test message" });
    this.page.errors.push({ type: "danger", title: "Error", message: "Test error message" });

    this.page.render();
  });

  it("はView#errorsの件数分エラー表示を行う", function() {
    expect(this.page.$("div.alert").length).toEqual(2);
  });

  it("はView#errorsの情報を元にエラー表示を行う", function() {
    var first = this.page.$("div.alert").eq(0);
    var second = this.page.$("div.alert").eq(1);

    expect(first.hasClass("alert-warning")).toBeTruthy();
    expect(second.hasClass("alert-danger")).toBeTruthy();

    expect(first.find("strong").text()).toEqual("Test: ");
    expect(second.find("strong").text()).toEqual("Error: ");

    expect(first.find("strong").next().text()).toEqual("Test message");
    expect(second.find("strong").next().text()).toEqual("Test error message");
  });

  it("はエラーメッセージの消去時にView#errorsを更新する", function() {
    expect(this.page.$("div.alert").length).toEqual(2);
    expect(this.page.errors.length).toEqual(2);

    this.page.$(".alert:first button").click();

    expect(this.page.$("div.alert").length).toEqual(1);
    expect(this.page.errors.length).toEqual(1);
  });
});
