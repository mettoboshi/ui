describe("CloudEntryPoint", function() {
  describe("#validate", function() {
    beforeEach(function() {
      this.infrastructure1 = new App.Models.Infrastructure({ driver: 'openstack' });
      this.infrastructure2 = new App.Models.Infrastructure({ driver: 'ec2' });

      this.cloudEntryPoint = new App.Models.CloudEntryPoint();

      //  全データを適切に設定
      this.cloudEntryPoint.set("entry_point", "entry_point");
      this.cloudEntryPoint.set("name", "user1");
    });

    describe("(OpenStack)", function() {
      beforeEach(function() {
        this.cloudEntryPoint.set("infrastructure_id", 1);
        this.cloudEntryPoint.set("infrastructure", this.infrastructure1.attributes);
        this.cloudEntryPoint.set("tenant", 'tenant');
        this.cloudEntryPoint.set("user", 'user');
        this.cloudEntryPoint.set("password", 'password');
      });

      it("は入力チェックを行い、問題が無ければtrueを返す", function() {
        expect(this.cloudEntryPoint.isValid(true)).toBeTruthy();
      });

      it("はentry_ponitが空の場合、入力チェックでfalseを返す", function() {
        this.cloudEntryPoint.set("entry_point", undefined);
        expect(this.cloudEntryPoint.isValid(true)).toBeFalsy();
      });

      it("はnameが空の場合、入力チェックでfalseを返す", function() {
        this.cloudEntryPoint.set("name", undefined);
        expect(this.cloudEntryPoint.isValid(true)).toBeFalsy();
      });

      it("はtenantが空の場合、入力チェックでfalseを返す", function() {
        this.cloudEntryPoint.set("tenant", undefined);
        expect(this.cloudEntryPoint.isValid(true)).toBeFalsy();
      });

      it("はuserが空の場合、入力チェックでfalseを返す", function() {
        this.cloudEntryPoint.set("user", undefined);
        expect(this.cloudEntryPoint.isValid(true)).toBeFalsy();
      });

      it("はpasswordが空の場合、入力チェックでfalseを返す", function() {
        this.cloudEntryPoint.set("password", undefined);
        expect(this.cloudEntryPoint.isValid(true)).toBeFalsy();
      });

      it("は入力エラーが無い場合、validated:validイベントをトリガーする", function() {
        var validSpy = jasmine.createSpy("validSpy");
        this.cloudEntryPoint.on("validated:valid", validSpy);

        expect(validSpy).not.toHaveBeenCalled();
        this.cloudEntryPoint.isValid(true);
        waitsFor(function() { return validSpy.wasCalled; }, 1000, "validated:valid event");
        runs(function() {
          expect(validSpy).toHaveBeenCalledWith(jasmine.any(App.Models.CloudEntryPoint), jasmine.any(Object));

          //  エラーメッセージが無いことをチェック
          var messages = validSpy.calls[0].args[1];
          expect(_.keys(messages).length).toEqual(0);
        });
      });

      it("は入力エラーがある場合、validated:invalidイベントをトリガーする", function() {
        var invalidSpy = jasmine.createSpy("invalidSpy");
        this.cloudEntryPoint.on("validated:invalid", invalidSpy);

        this.cloudEntryPoint.set("name", undefined);

        expect(invalidSpy).not.toHaveBeenCalled();
        this.cloudEntryPoint.isValid(true);
        waitsFor(function() { return invalidSpy.wasCalled; }, 1000, "validated:invalid event");
        runs(function() {
          expect(invalidSpy).toHaveBeenCalledWith(jasmine.any(App.Models.CloudEntryPoint), jasmine.any(Object));

          //  エラーメッセージのチェック
          var messages = invalidSpy.calls[0].args[1];
          expect(messages.name).toEqual("Name is required");
        });
      });
    });

    describe("(AWS)", function() {
      beforeEach(function() {
        this.cloudEntryPoint.set("infrastructure_id", 2);
        this.cloudEntryPoint.set("infrastructure", this.infrastructure2.attributes);
        this.cloudEntryPoint.set("key", 'key');
        this.cloudEntryPoint.set("secret", 'secret');
      });

      it("は入力チェックを行い、問題が無ければtrueを返す", function() {
        expect(this.cloudEntryPoint.isValid(true)).toBeTruthy();
      });

      it("はentry_ponitが空の場合、入力チェックでfalseを返す", function() {
        this.cloudEntryPoint.set("entry_point", undefined);
        expect(this.cloudEntryPoint.isValid(true)).toBeFalsy();
      });

      it("はnameが空の場合、入力チェックでfalseを返す", function() {
        this.cloudEntryPoint.set("name", undefined);
        expect(this.cloudEntryPoint.isValid(true)).toBeFalsy();
      });

      it("でkeyが空の場合、入力チェックでfalseを返す", function() {
        this.cloudEntryPoint.set("key", undefined);
        expect(this.cloudEntryPoint.isValid(true)).toBeFalsy();
      });

      it("でsecretが空の場合、入力チェックでfalseを返す", function() {
        this.cloudEntryPoint.set("secret", undefined);
        expect(this.cloudEntryPoint.isValid(true)).toBeFalsy();
      });
    });
  });

  describe("#fetch", function() {
    it("はinfrastructure/driverがopenstackの場合、keyをtenant/userに分割する", function() {
      var server = sinon.fakeServer.create();

      var cloudEntryPoint = new App.Models.CloudEntryPoint({id: 1});
      cloudEntryPoint.fetch();

      var json = {};
      json.infrastructure = {};
      json.infrastructure.driver = 'openstack';
      json.key = 'dummy_tenant+dummy_user';
      json.name = 'dummy_name';

      var headers = { "Content-Type": "application/json" };
      var body = JSON.stringify(json);
      _.last(server.requests).respond(200, headers, body);

      expect(cloudEntryPoint.get('name')).toEqual('dummy_name');
      expect(cloudEntryPoint.get('key')).toEqual('');
      expect(cloudEntryPoint.get('tenant')).toEqual('dummy_tenant');
      expect(cloudEntryPoint.get('user')).toEqual('dummy_user');

      server.restore();
    });
  });

  describe("#save", function() {
    it("はinfrastructure/driverがopenstackの場合、tenant/userからkeyを作成する", function() {
      var server = sinon.fakeServer.create();

      var cloudEntryPoint = new App.Models.CloudEntryPoint({id: 1});
      cloudEntryPoint.set('infrastructure', { driver: 'openstack' });
      cloudEntryPoint.set('tenant', 'dummy_tenant');
      cloudEntryPoint.set('user', 'dummy_user');

      cloudEntryPoint.save();

      var request = _.last(server.requests);
      var json = JSON.parse(request.requestBody);
      expect(json.tenant).toBeUndefined();
      expect(json.user).toBeUndefined();
      expect(json.key).toEqual('dummy_tenant+dummy_user');

      server.restore();
    });

    it("はinfrastructure/driverがopenstackの場合、passwordからsecretを作成する", function() {
      var server = sinon.fakeServer.create();

      var cloudEntryPoint = new App.Models.CloudEntryPoint({id: 1});
      cloudEntryPoint.set('infrastructure', { driver: 'openstack' });
      cloudEntryPoint.set('secret', 'dummy_secret');
      cloudEntryPoint.set('password', 'dummy_password');

      cloudEntryPoint.save();

      var request = _.last(server.requests);
      var json = JSON.parse(request.requestBody);
      expect(json.password).toBeUndefined();
      expect(json.secret).toEqual('dummy_password');

      server.restore();
    });
  });
});
