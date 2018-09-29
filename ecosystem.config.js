module.exports = {
  apps: [{
    name: 'pymaths',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-52-66-164-241.ap-south-1.compute.amazonaws.com',
      key: '~/.ssh/pymaths.pem',
      ref: 'origin/master',
      repo: 'git@bitbucket.org:shubhamgoyal001/pymaths.git',
      path: '/home/ubuntu/pymaths',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
