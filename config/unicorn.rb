listen ENV['GUI_PORT'] || 8081, tcp_nopush: true
worker_processes 4
pid File.expand_path('tmp/unicorn.pid')
stderr_path File.expand_path('log/unicorn.stderr.log')
stdout_path File.expand_path('log/unicorn.stdout.log')

timeout 300

preload_app true
