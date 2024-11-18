module.exports = {
  apps : [{
    name: 'match3-rpg-rest',
    script: './start_prod.sh',
    //out_file: '~/log/pm2/rest-api-out.log',
    error_file: '~/log/pm2/rest-api-error.log',
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    env: { // common env variable
        NODE_ENV: 'production'
    },
    env_production: { // khi deploy với option --env production
        NODE_ENV: "production",
        ENV_PATH: '../shared/',
        PORT: 7766
    },
    env_development: { // khi deploy với option --env development
        NODE_ENV: "development",
        ENV_PATH: '../shared/',
        PORT: 7766
    },
  }],

  deploy : {
    production : {
      key  : '~/.ssh/dev-aws-yunero.pem',
      user : 'ubuntu',
      host : '13.251.157.235',
      ref  : 'origin/master',
      repo : 'git@github.com:NotaVN/match3RPG.rest.api.git',
      path : '/home/ubuntu/app/match3RPG.rest.api',
      'pre-setup': "ssh-add /home/ubuntu/.ssh/id_ed25519",
      'pre-deploy': 'git pull',
      'post-deploy' : 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
