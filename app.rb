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
require 'rack/parser'
require 'sinatra'
require 'sinatra/reloader' if development?
require 'sinatra/json'
require 'digest/sha1'
require './lib/bridge'
require './src/dummy_route'
require 'json'

set :show_exceptions, false

use Rack::Parser, parsers: { 'application/json' => proc { |data| JSON.parse data } }

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

# /templates以下のAPIはmaker側へ委譲
get %r{^/templates/*} do
  Bridge.new(:maker).request request
end

# /templates以下のAPIはmaker側へ委譲
post %r{^/templates/*} do
  Bridge.new(:maker).request request
end

# /systems以下のAPIは実装されたのでconductor側へ委譲
get %r{^/systems/*} do
  Bridge.new(:conductor).request request
end

# /systems以下のAPIは実装されたのでconductor側へ委譲
post %r{^/systems/*} do
  Bridge.new(:conductor).request request
end

# /systems以下のAPIは実装されたのでconductor側へ委譲
delete %r{^/systems/*} do
  Bridge.new(:conductor).request request
end

# /cloud_entry_points以下のAPIは実装されたのでconductor側へ委譲
get %r{^/cloud_entry_points/*} do
  Bridge.new(:conductor).request request
end

# /infrastructure以下のAPIは実装されたのでconductor側へ委譲
get %r{^/infrastructure/*} do
  Bridge.new(:conductor).request request
end

# /cloud_entry_pointsは実装されたのでconductor側へ委譲
post %r{^/cloud_entry_points} do
  Bridge.new(:conductor).request request
end

# /cloud_entry_pointsは実装されたのでconductor側へ委譲
put %r{/cloud_entry_points/[0-9]+} do
  Bridge.new(:conductor).request request
end

# /cloud_entry_pointsは実装されたのでconductor側へ委譲
delete %r{/cloud_entry_points/[0-9]+} do
  Bridge.new(:conductor).request request
end

# それ以外の全てのAPIはconductor側へ委譲
get %r{^(?!/dummy)} do
  bridge = Bridge.new :conductor
  bridge.set_environment :development
  bridge.request request
end

post %r{^(?!/dummy)} do
  bridge = Bridge.new :conductor
  bridge.set_environment :development
  bridge.request request
end

put %r{^(?!/dummy)} do
  bridge = Bridge.new :conductor
  bridge.set_environment :development
  bridge.request request
end

delete %r{^(?!/dummy)} do
  bridge = Bridge.new :conductor
  bridge.set_environment :development
  bridge.request request
end

error do
  error = env['sinatra.error']
  logger.error "[Error] #{error.message}"
  logger.error error.backtrace.map { |line| ' ' * 4 + line }.join "\n"
  json message: error.message
end
