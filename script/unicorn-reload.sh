#!/bin/sh

cd $(dirname $0)/..

if ! [ -f tmp/unicorn.pid ]; then
  if [ $1"" == "" ]; then
    root_dir=`basename $PWD`
  else
    root_dir=$1
  fi

  # RAILS_ENVが未指定ならdevelopmentとして扱う
  if [ $RAILS_ENV"" == "" ]; then
    RAILS_ENV=development
  fi

  # unicornの新規起動
  echo "Start unicorn($root_dir) ..."
  BUILD_ID=dontKillMe /usr/local/rbenv/shims/bundle exec unicorn_rails -c config/unicorn.rb -E $RAILS_ENV -D --path /$root_dir
else
  echo "Unicorn is already running. Will reload unicorn."
  kill -HUP `cat tmp/unicorn.pid`
fi

