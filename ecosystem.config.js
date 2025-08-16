module.exports = {
  apps: [
    {
      name: 'uploader',
      script: './dist/main.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster', // cluster mode for I/O operations
      env: {
        NODE_ENV: 'production',
        // Optimize thread pool for file I/O operations
        UV_THREADPOOL_SIZE: 16, // Increase from default 4 to handle more concurrent I/O
        // Memory storage option for small files (optional)
        UPLOAD_STRATEGY: 'disk', // or 'memory' for better performance with small files
      },
      // PM2 specific optimizations
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      node_args: [
        '--max-old-space-size=1024', // Increase heap size
        '--max-semi-space-size=128', // Optimize GC for better performance
      ],
      // Graceful reload for zero-downtime deployments
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
