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
require 'sinatra'
require 'sinatra/reloader' if development?
require 'sinatra/json'
require 'digest/sha1'
require './lib/bridge'

# rubocop: disable SymbolName
# rubocop: disable MethodLength
get '/dummy/hi' do
  'Hello World!'
end

get '/dummy/instances' do
  instance_list = []
  (1..10).each do |n|
    instance_list << get_instance(n)
  end
  json instance_list
end

get '/dummy/instances/:id' do
  json get_instance params[:id]
end

get '/dummy/systems' do
  system_list = []
  (1..8).each do |n|
    system = get_system(n)
    system.delete(:xml)
    system.delete(:meta_xml)
    system_list << system
  end

  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 5).to_i

  json total: system_list.size, data: system_list.slice((page - 1) * per_page, per_page)
end

get '/dummy/systems/:id' do
  json get_system params[:id].to_i
end

get '/dummy/systems/:id/machine_groups' do
  mg_list = []
  names = ['Web ServerG', 'AP ServerG', 'DB ServerG', 'Monitor ServerG']
  (1..4).each do |n|
    mg = {}
    mg[:id] = "#{n}"
    mg[:name] = names[n - 1]

    mg_list << mg
  end

  json mg_list
end

get '/dummy/system/:id/machines' do
end

get '/dummy/system/:id/networks' do
end

post '/dummy/systems' do
  status 201
  json get_system 1
end

put '/dummy/systems/:id' do
  status 200
end

delete '/dummy/systems/:id' do
  status 200
end

get '/dummy/systems/:system_id/applications' do
  application_list = []
  application_list << get_application(1, params[:system_id].to_i)

  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 5).to_i

  json total: application_list.size, data: application_list.slice((page - 1) * per_page, per_page)
end

get '/dummy/systems/:system_id/applications/:application_id' do
  json get_application(params[:application_id].to_i, params[:system_id].to_i)
end

post '/dummy/systems/:system_id/applications' do
  status 201
  json get_application(1, 1)
end

post '/dummy/systems/:system_id/applications/:application_id/deploy' do
  status 200
  json Hash.new
end

get '/dummy/systems/:system_id/applications/:application_id/application_files' do
  file_list = []
  (1..3).each do |n|
    file_list << get_application_file(n.to_i, params[:system_id].to_i, params[:application_id].to_i)
  end

  json file_list
end

post '/dummy/systems/:system_id/applications/:application_id/application_files' do
  status 201
  json get_application_file(1, 1, 1)
end

delete '/dummy/systems/:system_id/applications/:application_id/application_files/:application_file_id' do
  status 200
  json Hash.new
end

get '/dummy/cloud_entry_points' do
  cloud_entry_point_list = []
  (1..20).each do |n|
    cloud_entry_point = get_cloud_entry_point(n)
    cloud_entry_point_list << cloud_entry_point
  end

  if blank?(params[:page]) && blank?(params[:per_page])
    json data: cloud_entry_point_list
  else
    page = (params[:page] || 1).to_i
    per_page = (params[:per_page] || 5).to_i

    json total: cloud_entry_point_list.size, data: cloud_entry_point_list.slice((page - 1) * per_page, per_page)
  end
end

get '/dummy/cloud_entry_points/:id' do
  json get_cloud_entry_point params[:id]
end

post '/dummy/cloud_entry_points' do
  status 200
  json get_cloud_entry_point 1
end

put '/dummy/cloud_entry_points/:id' do
  status 200
  json get_cloud_entry_point params[:id]
end

delete '/dummy/cloud_entry_points/:id' do
  status 200
  json Hash.new
end

get '/dummy/infrastructures' do
  infrastructure_list = []
  (1..10).each do |n|
    infrastructure_list << get_infrastructures(n)
  end

  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 5).to_i

  json total: infrastructure_list.size, data: infrastructure_list.slice((page - 1) * per_page, per_page)
end

get '/dummy/infrastructures/:id' do
  json get_infrastructures(params[:id])
end

get '/dummy/users' do
  user_list = []
  (1..15).each do |n|
    user_list << get_user(n)
  end

  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 5).to_i

  json total: user_list.size, data: user_list.slice((page - 1) * per_page, per_page)
end

get '/dummy/users/:id' do
  json get_user params[:id].to_i
end

post '/dummy/users' do
  status 201
  '{}'
end

get '/dummy/master/roles' do
  role_list = []
  role_list << { value: 1, label: 'Admin' }
  role_list << { value: 2, label: 'Member' }
  role_list << { value: 3, label: 'Viewer' }

  json role_list
end

post '/dummy/login' do
  # エラーが発生する例が欲しいので、特定ユーザ名の場合はエラーを返す
  if params[:login_id] == 'error'
    status 500
    return json result: :error, message: 'エラー発生用ユーザを使用しました'
  end

  # 本来はBridgeを使ってCloudConductor側に処理を委譲するが、CC側ができるまでは自分自身でダミーを返す
  if params[:login_id] == 'test' && params[:password] == 'password'
    json result: :success, access_token: '23b689b60cb629a38e6b3bc62be61a82'
  else
    status 401
    json result: :error, message: 'ログインIDまたはパスワードが違います'
  end
end

post '/dummy/logout' do
  # 本来はBridgeを使ってCloudConductor側に処理を委譲するが、CC側ができるまでは自分自身でダミーを返す
  return 'OK' if params[:access_token] == '23b689b60cb629a38e6b3bc62be61a82'
end

private

def get_instance(n)
  instance = {}
  instance[:name] = "Instance #{n}"
  instance[:memory] = "#{n} GB"

  instance
end

def get_system(n)
  system = {}

  # rubocop:disable LineLength
  name = ['CloudConductorPortal', '社外発信用技術ブログ(Tech-Scketch)', 'A部門向けECサイト', 'B部門向けJavaアプリケーション', 'C部門向けJavaアプリケーション', 'D部門向けJavaアプリケーション', 'E部門向けJavaアプリケーション', 'F部門向けJavaアプリケーション']
  template_name = ['ポータルサイト', 'CMS', 'EC-サイト(小規模用)', 'Javaアプリケーション', 'Javaアプリケーション', 'Javaアプリケーション', 'Javaアプリケーション', 'Javaアプリケーション']
  create_date = %w(2013-11-26 2013-11-27 2013-11-28 2013-12-01 2013-12-02 2013-12-03 2013-12-04 2013-12-05)
  # rubocop:enable LineLength

  system[:id] = "#{n}"
  system[:name] = name[n - 1]
  system[:template_name] = template_name[n - 1]
  if n.to_i.odd?
    system[:status] = {
      type: 'CREATING',
      message: nil
    }
  else
    system[:status] = {
      type: 'ERROR',
      message: 'Error Occured!! Please contact your system administrator.'
    }
  end
  system[:create_date] = create_date[n - 1]
  system[:update_date] = '2013/11/11'
  system[:template_xml] = <<EOS
<?xml version="1.0" encoding="UTF-8" ?>
<cc:System xmlns:cc="http://cloudconductor.org/namespaces/cc">
  <cc:Name>3層モデルのサンプル2</cc:Name>
  <cc:Description>これはサンプルデータです1</cc:Description>
  <cc:Author>竹澤1</cc:Author>
  <cc:Date>2014-01-20</cc:Date>
  <cc:License>MIT</cc:License>
  <cc:Infrastructures>
    <cc:Infrastructure id="infra1">
      <cc:Name>Infra1</cc:Name>
    </cc:Infrastructure>
  </cc:Infrastructures>
  <cc:Machines>
    <cc:Machine id="web1">
      <cc:Name>Web Server</cc:Name>
      <cc:SpecType>New Spec Type</cc:SpecType>
      <cc:OSType>New OS Type</cc:OSType>
      <cc:OSVersion>New OS Version</cc:OSVersion>
      <cc:NetworkInterfaces>
        <cc:NetworkInterface ref="dmz_g1" />
      </cc:NetworkInterfaces>
      <cc:MachineFilters />
    </cc:Machine>
    <cc:Machine id="ap_1">
      <cc:Name>AP 1</cc:Name>
      <cc:SpecType>New Spec Type</cc:SpecType>
      <cc:OSType>New OS Type</cc:OSType>
      <cc:OSVersion>New OS Version</cc:OSVersion>
      <cc:NetworkInterfaces>
        <cc:NetworkInterface ref="private_g1" />
      </cc:NetworkInterfaces>
      <cc:MachineFilters />
    </cc:Machine>
    <cc:Machine id="db1">
      <cc:Name>DB 1</cc:Name>
      <cc:SpecType>New Spec Type</cc:SpecType>
      <cc:OSType>New OS Type</cc:OSType>
      <cc:OSVersion>New OS Version</cc:OSVersion>
      <cc:NetworkInterfaces>
        <cc:NetworkInterface ref="private_g1" />
      </cc:NetworkInterfaces>
      <cc:Volumes>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1">
          <cc:MountPoint />
        </cc:Volume>
        <cc:Volume ref="volume1" />
      </cc:Volumes>
      <cc:MachineFilters />
    </cc:Machine>
    <cc:Machine id="monitor1">
      <cc:Name>Monitor 1</cc:Name>
      <cc:SpecType>New Spec Type</cc:SpecType>
      <cc:OSType>New OS Type</cc:OSType>
      <cc:OSVersion>New OS Version</cc:OSVersion>
      <cc:NetworkInterfaces>
        <cc:NetworkInterface ref="dmz_g1" />
      </cc:NetworkInterfaces>
      <cc:MachineFilters />
    </cc:Machine>
  </cc:Machines>
  <cc:MachineGroups>
    <cc:MachineGroup id="web_g1" ref="web1">
      <cc:Name>Web ServerG</cc:Name>
      <cc:Infrastructures>
        <cc:Infrastructure ref="infra1" />
      </cc:Infrastructures>
      <cc:FloatingIP ref="new_floating_ip_id" />
      <cc:NodeType>
        <cc:Single />
      </cc:NodeType>
    </cc:MachineGroup>
    <cc:MachineGroup id="ap_g1" ref="ap_1">
      <cc:Name>AP ServerG</cc:Name>
      <cc:Infrastructures>
        <cc:Infrastructure ref="infra1" />
      </cc:Infrastructures>
      <cc:FloatingIP ref="new_floating_ip_id" />
      <cc:NodeType>
        <cc:Single />
      </cc:NodeType>
    </cc:MachineGroup>
    <cc:MachineGroup id="db_g1" ref="db1">
      <cc:Name>DB ServerG</cc:Name>
      <cc:Infrastructures>
        <cc:Infrastructure ref="infra1" />
      </cc:Infrastructures>
      <cc:FloatingIP ref="new_floating_ip_id" />
      <cc:NodeType>
        <cc:Single />
      </cc:NodeType>
    </cc:MachineGroup>
    <cc:MachineGroup id="monitor_g1" ref="monitor1">
      <cc:Name>Monitor ServerG</cc:Name>
      <cc:Infrastructures>
        <cc:Infrastructure ref="infra1" />
      </cc:Infrastructures>
      <cc:FloatingIP ref="new_floating_ip_id" />
      <cc:NodeType>
        <cc:Single />
      </cc:NodeType>
    </cc:MachineGroup>
  </cc:MachineGroups>
  <cc:Volumes>
    <cc:Volume id="volume1">
      <cc:Size>40</cc:Size>
      <cc:IOPS>low</cc:IOPS>
    </cc:Volume>
  </cc:Volumes>
  <cc:Networks>
    <cc:Network id="public1">
      <cc:Name>Public</cc:Name>
    </cc:Network>
    <cc:Network id="dmz1">
      <cc:Name>DMZ</cc:Name>
    </cc:Network>
    <cc:Network id="private1">
      <cc:Name>private 1</cc:Name>
    </cc:Network>
  </cc:Networks>
  <cc:NetworkGroups>
    <cc:NetworkGroup id="publicg1">
      <cc:Name>Public G1</cc:Name>
      <cc:Networks>
        <cc:Network ref="public1">
          <cc:Infrastructures>
            <cc:Infrastructure ref="infra1" />
          </cc:Infrastructures>
        </cc:Network>
      </cc:Networks>
      <cc:NetworkFilters />
    </cc:NetworkGroup>
    <cc:NetworkGroup id="dmz_g1">
      <cc:Name>DMZ</cc:Name>
      <cc:Networks>
        <cc:Network ref="dmz1">
          <cc:Infrastructures>
            <cc:Infrastructure ref="infra1" />
          </cc:Infrastructures>
        </cc:Network>
      </cc:Networks>
      <cc:NetworkFilters />
    </cc:NetworkGroup>
    <cc:NetworkGroup id="private_g1">
      <cc:Name>private g1</cc:Name>
      <cc:Networks>
        <cc:Network ref="private1">
          <cc:Infrastructures>
            <cc:Infrastructure ref="infra1" />
          </cc:Infrastructures>
        </cc:Network>
      </cc:Networks>
      <cc:NetworkFilters />
    </cc:NetworkGroup>
  </cc:NetworkGroups>
  <cc:Routes>
    <cc:Route id="test">
      <cc:Destination />
      <cc:Target />
    </cc:Route>
  </cc:Routes>
  <cc:FloatingIPs>
    <cc:FloatingIP id="new_floating_ip_id">
      <cc:Name />
    </cc:FloatingIP>
    <cc:FloatingIP id="new_floating_ip_id">
      <cc:Name />
    </cc:FloatingIP>
    <cc:FloatingIP id="new_floating_ip_id">
      <cc:Name />
    </cc:FloatingIP>
    <cc:FloatingIP id="new_floating_ip_id">
      <cc:Name />
    </cc:FloatingIP>
  </cc:FloatingIPs>
</cc:System>
EOS

  system[:meta_xml] = <<EOS
<?xml version="1.0" encoding="UTF-8" ?>
<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ccm:Nodes>
    <ccm:Node id="infra1" xsi:type="ccm:Infrastructure">
      <ccm:x>106.5</ccm:x>
      <ccm:y>54.5</ccm:y>
      <ccm:z>0</ccm:z>
      <ccm:width>790</ccm:width>
      <ccm:height>630</ccm:height>
    </ccm:Node>
    <ccm:Node id="public1" xsi:type="ccm:Network">
      <ccm:x>298.5</ccm:x>
      <ccm:y>79.5</ccm:y>
      <ccm:z>1</ccm:z>
      <ccm:children>1</ccm:children>
    </ccm:Node>
    <ccm:Node id="dmz1" xsi:type="ccm:Network">
      <ccm:x>359.5</ccm:x>
      <ccm:y>245.5</ccm:y>
      <ccm:z>3</ccm:z>
      <ccm:children>3</ccm:children>
    </ccm:Node>
    <ccm:Node id="private1" xsi:type="ccm:Network">
      <ccm:x>134.5</ccm:x>
      <ccm:y>440.5</ccm:y>
      <ccm:z>4</ccm:z>
      <ccm:children>3</ccm:children>
    </ccm:Node>
    <ccm:Node id="web1" xsi:type="ccm:Machine">
      <ccm:x>525.5</ccm:x>
      <ccm:y>289.5</ccm:y>
      <ccm:z>5</ccm:z>
    </ccm:Node>
    <ccm:Node id="ap_1" xsi:type="ccm:Machine">
      <ccm:x>305.5</ccm:x>
      <ccm:y>486.5</ccm:y>
      <ccm:z>6</ccm:z>
    </ccm:Node>
    <ccm:Node id="db1" xsi:type="ccm:Machine">
      <ccm:x>455.5</ccm:x>
      <ccm:y>489.5</ccm:y>
      <ccm:z>7</ccm:z>
    </ccm:Node>
    <ccm:Node id="volume1" xsi:type="ccm:Volume">
      <ccm:x>813.5</ccm:x>
      <ccm:y>587.5</ccm:y>
      <ccm:z>8</ccm:z>
    </ccm:Node>
    <ccm:Node id="monitor1" xsi:type="ccm:Machine">
      <ccm:x>667.5</ccm:x>
      <ccm:y>295.5</ccm:y>
      <ccm:z>9</ccm:z>
    </ccm:Node>
    <ccm:Node id="router" xsi:type="ccm:Router">
      <ccm:x>200.5</ccm:x>
      <ccm:y>300.5</ccm:y>
      <ccm:z>9</ccm:z>
    </ccm:Node>
  </ccm:Nodes>
  <ccm:Links>
    <ccm:Link>
      <ccm:Source ref="public1">
        <ccm:Selector>g:nth-child(1) g:nth-child(3) circle:nth-child(1)</ccm:Selector>
      </ccm:Source>
      <ccm:Target ref="router" />
      <ccm:Vertices>
        <ccm:Vertice>
          <ccm:x>380</ccm:x>
          <ccm:y>150</ccm:y>
        </ccm:Vertice>
        <ccm:Vertice>
          <ccm:x>220</ccm:x>
          <ccm:y>150</ccm:y>
        </ccm:Vertice>
      </ccm:Vertices>
    </ccm:Link>
    <ccm:Link>
      <ccm:Source ref="dmz1">
        <ccm:Selector>g:nth-child(1) g:nth-child(3) circle:nth-child(1)</ccm:Selector>
      </ccm:Source>
      <ccm:Target ref="router" />
      <ccm:Vertices>
        <ccm:Vertice>
          <ccm:x>440</ccm:x>
          <ccm:y>320</ccm:y>
        </ccm:Vertice>
      </ccm:Vertices>
    </ccm:Link>
    <ccm:Link>
      <ccm:Source ref="dmz1">
        <ccm:Selector>g:nth-child(1) g:nth-child(3) circle:nth-child(2)</ccm:Selector>
      </ccm:Source>
      <ccm:Target ref="web1">
        <ccm:Selector>g:nth-child(1) g:nth-child(2)</ccm:Selector>
      </ccm:Target>
    </ccm:Link>
    <ccm:Link>
      <ccm:Source ref="monitor1">
        <ccm:Selector>g:nth-child(1) g:nth-child(2)</ccm:Selector>
      </ccm:Source>
      <ccm:Target ref="dmz1">
        <ccm:Selector>g:nth-child(1) g:nth-child(3) circle:nth-child(3)</ccm:Selector>
      </ccm:Target>
    </ccm:Link>
    <ccm:Link>
      <ccm:Source ref="private1">
        <ccm:Selector>g:nth-child(1) g:nth-child(3) circle:nth-child(2)</ccm:Selector>
      </ccm:Source>
      <ccm:Target ref="ap_1">
        <ccm:Selector>g:nth-child(1) g:nth-child(2)</ccm:Selector>
      </ccm:Target>
    </ccm:Link>
    <ccm:Link>
      <ccm:Source ref="private1">
        <ccm:Selector>g:nth-child(1) g:nth-child(3) circle:nth-child(1)</ccm:Selector>
      </ccm:Source>
      <ccm:Target ref="router" />
    </ccm:Link>
    <ccm:Link>
      <ccm:Source ref="private1">
        <ccm:Selector>g:nth-child(1) g:nth-child(3) circle:nth-child(3)</ccm:Selector>
      </ccm:Source>
      <ccm:Target ref="db1">
        <ccm:Selector>g:nth-child(1) g:nth-child(2)</ccm:Selector>
      </ccm:Target>
    </ccm:Link>
    <ccm:Link>
      <ccm:Source ref="db1">
        <ccm:Selector>g:nth-child(1) g:nth-child(2)</ccm:Selector>
      </ccm:Source>
      <ccm:Target ref="volume1" />
      <ccm:Vertices>
        <ccm:Vertice>
          <ccm:x>690</ccm:x>
          <ccm:y>510</ccm:y>
        </ccm:Vertice>
        <ccm:Vertice>
          <ccm:x>690</ccm:x>
          <ccm:y>610</ccm:y>
        </ccm:Vertice>
      </ccm:Vertices>
    </ccm:Link>
  </ccm:Links>
</ccm:Editor>
EOS
  system
end

def get_application(n, system_id)
  application = {}
  application[:id] = "#{n}"
  application[:state] = %w(NOT\ YET DEPLOYING SUCCESS ERROR)[(system_id.to_i - 1) % 4]

  application
end

def get_application_file(n, system_id, application_id)
  application_file = {}
  application_file[:id] = "#{n}"
  application_file[:machine_group_id] = "#{n % 4}"
  application_file[:file_name] = "test#{system_id}-#{application_id}-#{n}.war"

  application_file
end

def get_cloud_entry_point(n)
  cloud_entry_point = {}
  cloud_entry_point[:id] = n.to_i
  cloud_entry_point[:name] = "Cloud Entry Point#{n}"
  cloud_entry_point[:key] = 'key+tenant'
  cloud_entry_point[:secret] = 'secret'
  cloud_entry_point[:infrastructure] = {
    id: n.to_i,
    name: "Infrastructure#{n}",
    driver: %w(ec2 openstack)[n.to_i % 2]
  }

  if cloud_entry_point[:infrastructure][:driver] == 'ec2'
    cloud_entry_point[:entry_point] = 'ap-northeast-1'
  else
    cloud_entry_point[:entry_point] = 'http://192.168.166.105:5000/v2.0/'
  end

  cloud_entry_point[:proxy_url] = 'http://example.com/'
  cloud_entry_point[:proxy_user] = 'proxy_user'
  cloud_entry_point[:proxy_password] = 'proxy_password'
  cloud_entry_point[:no_proxy] = '172.0.0.1'
  cloud_entry_point[:create_date] = '2014-01-27T05:50:08+09:00'
  cloud_entry_point[:update_date] = '2014-01-27T05:50:08+09:00'

  cloud_entry_point
end

def get_infrastructures(n)
  infrastructure = {}
  infrastructure[:id] = n.to_i
  infrastructure[:name] = "AWS Tokyo Region #{n}"
  infrastructure[:base_url] = "http://example.com/#{n}"
  infrastructure[:driver] = %w(ec2 openstack)[n.to_i % 2]
  infrastructure[:create_date] = '2014/01/23'
  infrastructure[:update_date] = '2014/01/23'

  infrastructure
end

def get_user(n)
  names = ['田中', '佐藤', '鈴木', '山田', '斉藤']
  user = {}
  user[:id] = n.to_s
  user[:login_id] = "user#{n}"
  user[:name] = names[n % 5] + (n / 6).to_s
  user[:crypted_password] = Digest::SHA1.hexdigest"crypted_password_#{n}"
  user[:role] = n - ((n - 1) / 3 * 3)

  user
end

def blank?(arg)
  arg.nil? || arg.empty?
end
