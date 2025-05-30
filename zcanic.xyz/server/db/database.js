require('dotenv').config(); // Load environment variables from .env file
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// --- Database Configuration ---
// Directly use standard environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  // Use environment variables for pool limits, with defaults
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT, 10) || 10, // Default limit 10
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0 // Default queue limit 0 (unlimited)
};

// Validate essential DB config
if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
  logger.error('[DB] Missing essential DB config (DB_HOST, DB_USER, DB_DATABASE). Exiting.');
  process.exit(1);
}

logger.info(`[DB] Config loaded: host=${dbConfig.host}, user=${dbConfig.user}, database=${dbConfig.database}, poolLimit=${dbConfig.connectionLimit}, queueLimit=${dbConfig.queueLimit}`);

// Initialize the connection pool directly
let pool;
try {
  pool = mysql.createPool(dbConfig);
  logger.info(`[DB] Connection pool created for database: ${dbConfig.database}.`);
} catch (error) {
  logger.error('[DB] Failed to create database connection pool:', error);
  process.exit(1);
}

// --- Database Initialization Function (to be called from server.js) ---
const initializeDatabase = async (dbPool) => {
  logger.info('开始检查和初始化数据库表结构喵...');
  try {
    // Test connection
    const connection = await dbPool.getConnection();
    logger.info('成功连接到数据库喵！');
    connection.release();

    // Create users table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user', 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info("数据表 'users' OK 喵~");

    // Create blog_posts table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        imageUrl VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_blog_posts_user_id (user_id),
        FULLTEXT INDEX ft_title_content (title, content) COMMENT 'For blog search'
      );
    `);
    logger.info("数据表 'blog_posts' OK 喵~");

    // Create daily_fortunes table with new fields
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS daily_fortunes (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT,
        generated_at DATE NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'completed',
        task_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_fortune_per_day (user_id, generated_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    logger.info("数据表 'daily_fortunes' OK 喵~");

    // Create user_memories table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS user_memories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        memory_type ENUM('fact', 'preference', 'summary') DEFAULT 'fact',
        memory_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_memories_user_id (user_id)
      );
    `);
    logger.info("数据表 'user_memories' OK 喵~");

    // Create comments table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        parent_comment_id INT NULL COMMENT 'For nested comments',
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE, 
        INDEX idx_comments_post_id (post_id),
        INDEX idx_comments_user_id (user_id)
      );
    `);
    logger.info("数据表 'comments' OK 喵~");

    // 创建异步任务表
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS async_tasks (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        related_id VARCHAR(36) NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
        result TEXT,
        error TEXT,
        extra_data TEXT COMMENT 'For storing custom settings like AI parameters',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_tasks_status (status),
        INDEX idx_tasks_user (user_id),
        INDEX idx_tasks_related (related_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info("数据表 'async_tasks' OK 喵~");

    // Check if extra_data column exists, add if it doesn't
    await dbPool.query(`
      SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'async_tasks' AND COLUMN_NAME = 'extra_data'
    `).then(async ([columns]) => {
      if (columns.length === 0) {
        // Column doesn't exist yet, add it
        await dbPool.query(`
          ALTER TABLE async_tasks 
          ADD COLUMN extra_data TEXT COMMENT 'For storing custom settings like AI parameters' 
          AFTER error
        `);
        logger.info("添加了 'extra_data' 列到 'async_tasks' 表喵~");
      }
    });

    // 创建聊天会话表
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_sessions_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info("数据表 'chat_sessions' OK 喵~");

    // 创建聊天消息表
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(36) PRIMARY KEY,
        session_id VARCHAR(36) NOT NULL,
        role ENUM('user', 'assistant', 'system') NOT NULL,
        content TEXT NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'completed',
        task_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
        INDEX idx_messages_session (session_id),
        INDEX idx_messages_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info("数据表 'chat_messages' OK 喵~");

    logger.info('所有必需的数据表检查/创建完成喵~');

  } catch (error) {
    logger.error('数据库初始化失败喵 T_T:', error);
    throw error; // Rethrow to indicate failure to the caller (server.js)
  }
};

// Export the initialized pool and the initializer function
module.exports = {
  pool, 
  initializeDatabase
}; 