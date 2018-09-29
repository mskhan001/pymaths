module.exports = {
  apps: [{
    name: 'pymaths',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-18-191-25-224.us-east-2.compute.amazonaws.com',
      key: '~/.ssh/pymaths.pem',
      ref: 'origin/master',
      repo: 'git@bitbucket.org:prateek964/pymaths.git',
      path: '/home/ubuntu/pymaths',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
