# Performance Optimization Guide

## 🚀 Current Optimizations Applied

### 1. Clustering Configuration (PM2)
- **Instances**: 3 workers (leaving 1 core for system)
- **Memory limits**: 512MB per worker with auto-restart
- **Load balancing**: Round-robin across workers
- **Monitoring**: Comprehensive logging enabled

### 2. I/O Operations Optimized
- **Removed blocking operations**: No more `fs.existsSync()`
- **Directory caching**: Avoid repeated filesystem checks
- **Async operations**: All file operations are non-blocking
- **Better error handling**: Graceful failure recovery

### 3. Rate Limiting Enhanced
- **Multi-tier limits**: Short (1min), Medium (5min), Long (1hr)
- **Per-IP throttling**: Prevents single user abuse
- **Ready for Redis**: Prepared for distributed throttling

### 4. Security & Performance Headers
- **Content-Type protection**: Prevents MIME sniffing
- **XSS protection**: Enhanced security
- **Caching strategies**: Optimized for static assets

## 📊 Performance Monitoring Setup

### Install Dependencies
```bash
npm install compression helmet @nestjs/terminus prom-client
```

### Monitoring Endpoints
```typescript
// Add to your app.module.ts
import { TerminusModule } from '@nestjs/terminus';

// Health checks for monitoring
@Get('health')
healthCheck(): object {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
  };
}
```

## 🔧 High Traffic Optimization Strategies

### Option 1: Clustering (Current - Recommended)
```javascript
// ecosystem.config.js - Current optimized setup
instances: 3, // Optimal for 4-core system
max_memory_restart: '512M',
node_args: '--max-old-space-size=512'
```

**Benefits:**
- ✅ Process isolation
- ✅ Better fault tolerance  
- ✅ Optimal for I/O operations
- ✅ Memory isolation per worker

### Option 2: Thread Pool Optimization
```javascript
// Only if you switch to worker threads
process.env.UV_THREADPOOL_SIZE = '8'; // Increase from default 4
```

**When to use:**
- CPU-intensive file processing
- Image manipulation/compression
- Large file parsing operations

## 🎯 Performance Tuning Recommendations

### 1. Operating System Level
```bash
# Increase file descriptor limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# TCP optimization for high connections
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" >> /etc/sysctl.conf
sysctl -p
```

### 2. Node.js Optimization
```bash
# Environment variables for production
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"
export UV_THREADPOOL_SIZE=8
```

### 3. Nginx Frontend (Recommended)
```nginx
upstream app_backend {
    least_conn;
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    listen 80;
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain application/json;
    
    location /upload/ {
        proxy_pass http://app_backend;
        proxy_request_buffering off; # For large uploads
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
    
    location /vebinar-excel/ {
        # Serve static files directly
        root /path/to/your/app;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📈 Scaling Strategies

### Phase 1: Single Server (Current)
- 3 clustered workers
- Local file storage
- In-memory rate limiting

### Phase 2: Horizontal Scaling
```typescript
// Add Redis for shared state
import { ThrottlerStorageRedisService } from '@nestjs/throttler/storage';

// In app.module.ts
ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService(redisClient),
  // ... throttlers config
});
```

### Phase 3: Microservices
- Upload service (current app)
- File processing service
- Notification service
- Load balancer (nginx/HAProxy)

## 🔍 Performance Monitoring Commands

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Performance logs
pm2 logs uploader --lines 100

# Memory usage
pm2 show uploader

# Restart all workers
pm2 reload uploader
```

### System Monitoring
```bash
# CPU and memory usage
htop

# Network connections
netstat -an | grep :8000 | wc -l

# File descriptors
lsof -p $(pgrep -f "node.*main.js") | wc -l

# Disk I/O
iostat -x 1
```

## ⚡ Load Testing

### Basic Load Test
```bash
# Install artillery
npm install -g artillery

# Test file upload
artillery quick --count 10 --num 50 \
  --output report.json \
  http://localhost:8000/upload/file
```

### Stress Test Script
```javascript
// loadtest.js
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function uploadTest() {
  const form = new FormData();
  form.append('file', fs.createReadStream('test-file.jpg'));
  
  const start = Date.now();
  try {
    await axios.post('http://localhost:8000/upload/file', form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });
    console.log(`Upload completed in ${Date.now() - start}ms`);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

// Run 100 concurrent uploads
Promise.all(Array(100).fill().map(() => uploadTest()));
```

## 🚨 Alert Thresholds

### Memory Usage
- **Warning**: > 80% of 512MB limit
- **Critical**: > 95% of 512MB limit

### Response Time
- **Warning**: > 2 seconds average
- **Critical**: > 5 seconds average

### Error Rate
- **Warning**: > 1% error rate
- **Critical**: > 5% error rate

### Disk Space
- **Warning**: > 85% upload directory
- **Critical**: > 95% upload directory

## 🔄 Auto-scaling Configuration

```bash
# PM2 ecosystem with auto-scaling
module.exports = {
  apps: [{
    // ... existing config
    
    // Auto-scale based on CPU
    instances: 'max',
    exec_mode: 'cluster',
    
    // Scale down when CPU < 30% for 5 minutes
    // Scale up when CPU > 70% for 2 minutes
    autoscale: {
      cpu: { min: 30, max: 70 },
      memory: { min: 256, max: 400 },
      time: { down: 300, up: 120 }
    }
  }]
};
```

Remember: **Clustering is optimal for your I/O-heavy file upload application**. Thread pool optimization should only be considered if you add CPU-intensive processing tasks.