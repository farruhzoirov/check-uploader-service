module.exports = {
  apps: [
    {
      name: 'uploader',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster', // cluster mode
    },
  ],
};
