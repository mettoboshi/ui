About
=====

CloudConductor is hybrid cloud management and deployment tool.
It targets to enable transparent management of multiple cloud environment
and self-directive operation.

CloudConductor comprises following applications:

- ui(this application)
- maker
- conductor

For more information, please visit [official web site](http://cloudconductor.org/).


Requirements
============

System Requirements
-------------------

- OS: Red Hat Enterprise Linux 6.5 or CentOS 6.5

Prerequisites
-------------

- git
- ruby (>= 2.0.0)
- rubygems
- bundler
- nodejs


Quick Start
===========

- Clone github repository

    git clone https://github.com/cloudconductor/ui.git

- Copy and edit setting file to connect other applications which are maker and conductor.

    cd ui/config
    cp bridge.yml.smp bridge.yml
    vi bridge.yml

Change `protocol`, `host`, `port` and `root_path` in development section to connect each applications.

- Install dependencies.

    cd ..
    bundle install
    bundle exec rake init

- Run server

    bundle exec rake server:start

- Stop server

    bundle exec rake server:stop


Copyright and License
=====================

Copyright (c) 2014 TIS Inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.


Contact
=======

For more information: <http://cloudconductor.org/>

Report issues and requests: <https://github.com/cloudconductor/issues>

Send feedback to: <cloudconductor@tis.co.jp>
