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
require 'yaml'
require 'net/http'

class Bridge
  attr_reader :environment, :protocol, :host, :port, :root_path
  def initialize(target, config_path = nil)
    @target = target

    config_path = File.expand_path('../config/bridge.yml', File.dirname(__FILE__)) unless config_path
    @config = YAML.load_file config_path

    set_environment((ENV['RAILS_ENV'] || :development).to_sym)
  end

  def set_environment(environment)
    @environment = environment

    config = @config[@environment.to_s][@target.to_s]
    @host = config['host']
    @port = config['port']
    @protocol = config['protocol']
    @root_path = config['root_path']
  end

  def request(original)
    url = @root_path + original.path_info
    url += '?' + original.env['QUERY_STRING'] if original.env['QUERY_STRING']

    request_class = Net::HTTP.const_get original.request_method.capitalize.to_sym
    request = request_class.new url

    request.body = original.body.read if original.body
    request.content_type = original.content_type if original.content_type

    response = Net::HTTP.start(@host, @port) do |http|
      http.request(request)
    end

    # Response Headerから不要なものを削除
    headers = response.to_hash
    headers.delete 'status'
    headers.delete 'content-length'

    [response.code.to_i, headers, response.body]
  end
end
