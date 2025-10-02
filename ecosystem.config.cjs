module.exports = {
  apps: [{
    name: 'holy-guide',
    script: 'spa-server.js',
    cwd: '/home/deployer/projects/holy-guide',
    interpreter: 'node',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/home/deployer/projects/holy-guide/logs/err.log',
    out_file: '/home/deployer/projects/holy-guide/logs/out.log',
    log_file: '/home/deployer/projects/holy-guide/logs/combined.log',
    time: true
  }]
};