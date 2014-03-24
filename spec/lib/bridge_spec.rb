# Copyright 2014 TIS inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
require './lib/bridge.rb'
require 'net/http'
require 'sinatra'

describe Bridge do
  describe '#initialize' do
    after do
      ENV['RAILS_ENV'] = 'test'
    end

    it 'は設定ファイルのYAMLを読み込んでBridgeクラスを初期化する(conductor)' do
      config_path = File.expand_path('../fixtures/bridge.yml', File.dirname(__FILE__))
      @bridge = Bridge.new :conductor, config_path

      expect(@bridge.protocol).to eq('http')
      expect(@bridge.host).to eq('localhost')
      expect(@bridge.port).to eq(80)
      expect(@bridge.root_path).to eq('/conductor/dummy')
    end

    it 'は設定ファイルのYAMLを読み込んでBridgeクラスを初期化する(maker)' do
      config_path = File.expand_path('../fixtures/bridge.yml', File.dirname(__FILE__))
      @bridge = Bridge.new :maker, config_path

      expect(@bridge.protocol).to eq('http')
      expect(@bridge.host).to eq('localhost')
      expect(@bridge.port).to eq(80)
      expect(@bridge.root_path).to eq('/dummy-maker')
    end

    it 'は設定ファイルのYAMLが指定されなかった場合は./config/bridge.ymlを読み込む' do
      config_path = File.expand_path('../../config/bridge.yml', File.dirname(__FILE__))
      dummy_result = {
        'test' => {
          'conductor' => {},
          'maker' => {}
        }
      }

      YAML.should_receive(:load_file).with(config_path).and_return(dummy_result)
      @bridge = Bridge.new :maker
    end

    it 'は環境変数のRAILS_ENVで初期化する' do
      ENV['RAILS_ENV'] = 'production'
      config_path = File.expand_path('../fixtures/bridge.yml', File.dirname(__FILE__))
      @bridge = Bridge.new :maker, config_path

      expect(@bridge.environment).to eq(:production)
    end

    it 'は環境変数のRAILS_ENVが指定されていない場合developmentで初期化する' do
      ENV.delete('RAILS_ENV')
      config_path = File.expand_path('../fixtures/bridge.yml', File.dirname(__FILE__))
      @bridge = Bridge.new :maker, config_path

      expect(@bridge.environment).to eq(:development)
    end
  end

  describe do
    before :each do
      config_path = File.expand_path('../fixtures/bridge.yml', File.dirname(__FILE__))
      @bridge = Bridge.new :maker, config_path
    end

    describe '#set_environment' do
      it 'は指定した環境の設定に切り替える' do
        @bridge.set_environment :production
        expect(@bridge.protocol).to eq('https')
        expect(@bridge.host).to eq('192.168.0.1')
        expect(@bridge.port).to eq(8080)
        expect(@bridge.root_path).to eq('/production-maker')
      end
    end

    describe '#request(GET)' do
      before do
        @mocked_http = Net::HTTP.new 'localhost', 80
        @mocked_get = Net::HTTP::Get.new '/dummy'

        @mocked_result = Object.new
        @mocked_result.stub(:code).and_return('200')
        @mocked_result.stub(:to_hash).and_return('dummy' => 'dummy_header', 'status' => 'dummy', 'content-length' => 'dummy')
        @mocked_result.stub(:body).and_return('dummy_result')

        @mocked_http.stub(:request).and_return(@mocked_result)
        Net::HTTP.should_receive(:start).with('localhost', 80).and_yield(@mocked_http)

        @mocked_http.should_receive(:request).with(@mocked_get)

        @request = Object.new
        @request.stub(:request_method).and_return('GET')
        @request.stub(:content_type).and_return(nil)
        @request.stub(:body).and_return(nil)
        @request.stub(:path_info).and_return('/tests')
        @request.stub(:env).and_return('QUERY_STRING' => nil)
      end

      it 'は指定したリクエストをmakerサーバに中継する' do
        Net::HTTP::Get.should_receive(:new).with('/dummy-maker/tests').and_return(@mocked_get)

        code, _headers, body = @bridge.request @request
        expect(code).to eq(200)
        expect(body).to eq('dummy_result')
      end

      it 'は与えられたパラメータをそのまま中継する' do
        Net::HTTP::Get.should_receive(:new).with('/dummy-maker/tests?test=dummy&test2=dummy2').and_return(@mocked_get)

        @request.stub(:env).and_return('QUERY_STRING' => 'test=dummy&test2=dummy2')

        code, _headers, body = @bridge.request @request
        expect(code).to eq(200)
        expect(body).to eq('dummy_result')
      end

      it 'は不要なヘッダを削除して返す' do
        Net::HTTP::Get.should_receive(:new).with('/dummy-maker/tests').and_return(@mocked_get)

        code, headers, body = @bridge.request @request
        expect(code).to eq(200)
        expect(headers).to eq('dummy' => 'dummy_header')
        expect(body).to eq('dummy_result')
      end
    end

    describe '#request(POST)' do
      before do
        @mocked_http = Net::HTTP.new 'localhost', 80
        @mocked_post = Net::HTTP::Post.new '/dummy'

        @mocked_result = Object.new
        @mocked_result.stub(:code).and_return('200')
        @mocked_result.stub(:to_hash).and_return('dummy' => 'dummy_header')
        @mocked_result.stub(:body).and_return('dummy_result')

        @mocked_http.stub(:request).and_return(@mocked_result)
        Net::HTTP::Post.should_receive(:new).with('/dummy-maker/tests').and_return(@mocked_post)
        Net::HTTP.should_receive(:start).with('localhost', 80).and_yield(@mocked_http)

        @mocked_http.should_receive(:request).with(@mocked_post)
      end

      it 'は指定したPOSTリクエストをmakerサーバに中継する' do
        @request = Object.new
        @request.stub(:request_method).and_return('POST')
        @request.stub(:content_type).and_return('application/x-www-form-urlencoded')
        @request.stub(:body).and_return(StringIO.new('dummy=test'))
        @request.stub(:path_info).and_return('/tests')
        @request.stub(:env).and_return('QUERY_STRING' => nil)

        code, headers, body = @bridge.request @request
        expect(code).to eq(200)
        expect(headers).to eq('dummy' => 'dummy_header')
        expect(body).to eq('dummy_result')
      end
    end
  end
end
