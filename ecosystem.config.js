module.exports = {
  apps: [
    {
      name: 'uploader',
      script: './dist/main.js',
      instances: 3, // Leave 1 core for system processes
      exec_mode: 'cluster',
      // Performance optimizations
      max_memory_restart: '512M', // Restart if memory exceeds 512MB
      node_args: '--max-old-space-size=512', // Limit Node.js heap
      // Load balancing
      instance_var: 'INSTANCE_ID',
      // Logging for performance monitoring
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      // Auto-restart on crashes
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
    },
  ],
};
