module.exports = {
  apps: [{
    name: 'holy-guide',
    script: 'npx',
    args: 'serve /home/deployer/projects/holy-guide/dist -l 8082',
    cwd: '/home/deployer/projects/holy-guide',
    interpreter: 'none',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/home/deployer/projects/holy-guide/logs/err.log',
    out_file: '/home/deployer/projects/holy-guide/logs/out.log',
    log_file: '/home/deployer/projects/holy-guide/logs/combined.log',
    time: true,
    instances: 1
  }]
};