const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // 使用 promise 版本的 mysql2 喵~
const OpenAI = require('openai'); // <-- 导入 OpenAI
const multer = require('multer'); // <-- 导入 multer
const path = require('path');   // <-- 导入 path
const fs = require('fs');       // <-- 导入 fs (用于创建目录)

const app = express();
const port = 3001; // 我们让服务器运行在 3001 端口喵~

// --- 数据库配置 (使用占位符，部署前请替换!) ---
const dbConfig = {
  host: 'localhost', // 改回 localhost，因为后端和数据库将在同一台服务器运行喵~
  user: 'zcanic', // <- 修正用户名喵~
  password: '945b4886e669ffcb', // 主人提供的密码喵~
  database: 'zcanic', // 主人提供的数据库名喵~
  waitForConnections: true,
  connectionLimit: 10, // 连接池大小喵~
  queueLimit: 0
};

// --- OpenAI 配置 (安全警告!) ---
// ... (API Key logic - use process.env recommended!) ...
const apiKey = process.env.OPENAI_API_KEY || 'sk-************************************************'; // Example: prioritize env var
const apiBaseUrl = 'https://api.siliconflow.cn/v1'; // Define the base URL

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: apiBaseUrl, // <-- 添加 baseURL 配置！
});
console.log(`OpenAI 客户端已配置，将请求发送至: ${apiBaseUrl} 喵~`); // 添加日志确认

// --- Multer 配置 (用于图片上传) ---
const uploadDir = path.join(__dirname, 'public/uploads'); // 定义上传目录

// 确保上传目录存在
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`创建上传目录喵: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // 文件存储路径
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名: 时间戳-随机数.扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器，只允许图片
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件喵!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 限制文件大小为 5MB
}); 

let pool; // 数据库连接池

// --- 数据库初始化函数 ---
async function initializeDatabase() {
  try {
    // 尝试连接到 MySQL 服务器 (不指定数据库) 来创建数据库
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await tempConnection.end();
    console.log(`数据库 '${dbConfig.database}' 检查/创建完毕喵~`);

    // 现在创建连接池，连接到指定数据库
    pool = mysql.createPool(dbConfig);

    // 检查并创建 blog_posts 表
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        imageUrl VARCHAR(1024),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    console.log("数据表 'blog_posts' 检查/创建完毕喵~");

  } catch (error) {
    console.error('数据库初始化失败喵 (｡>﹏<｡): ', error);
    // 如果数据库无法初始化，服务器启动可能会失败或无法正常工作
    // 这里我们先退出进程，实际部署时可能需要更复杂的重试或告警逻辑
    process.exit(1);
  }
}

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体

// --- 配置静态文件服务，用于访问上传的图片 ---
// 请求 /uploads/xxx.jpg 将会查找 server/public/uploads/xxx.jpg 文件
app.use('/uploads', express.static(uploadDir)); 
console.log(`提供静态文件服务于 /uploads 路径，源自 ${uploadDir} 喵~`);

// API Endpoints

// 获取所有博客
app.get('/posts', async (req, res) => {
  console.log('GET /posts request received 喵~');
  try {
    const [rows] = await pool.query('SELECT * FROM blog_posts ORDER BY timestamp DESC');
    res.json(rows);
  } catch (error) {
    console.error('获取博客失败喵:', error);
    res.status(500).json({ message: '获取博客列表时发生错误 T_T' });
  }
});

// 添加新博客
app.post('/posts', async (req, res) => {
  console.log('POST /posts request received with body:', req.body);
  const { title, content, imageUrl } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required 喵!' });
  }

  try {
    const insertQuery = 'INSERT INTO blog_posts (title, content, imageUrl, timestamp) VALUES (?, ?, ?, ?)';
    const timestamp = new Date(); // 用数据库的 CURRENT_TIMESTAMP 也可以，这里用 JS 时间保持一致性
    const [result] = await pool.query(insertQuery, [title, content, imageUrl || null, timestamp]);

    const newPost = {
      id: result.insertId,
      title,
      content,
      imageUrl: imageUrl || null,
      timestamp: timestamp.toISOString(), // 返回 ISO 格式时间戳给前端
    };
    console.log('New post added to DB:', newPost);
    res.status(201).json(newPost);

  } catch (error) {
    console.error('添加博客失败喵:', error);
    res.status(500).json({ message: '添加博客时发生错误 T_T' });
  }
});

// 删除博客
app.delete('/posts/:id', async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  console.log(`DELETE /posts/${postId} request received 喵~`);

  if (isNaN(postId)) {
     return res.status(400).json({ message: '无效的博客 ID 喵!' });
  }

  try {
    const deleteQuery = 'DELETE FROM blog_posts WHERE id = ?';
    const [result] = await pool.query(deleteQuery, [postId]);

    if (result.affectedRows > 0) {
      console.log(`Post with id ${postId} deleted from DB.`);
      res.status(204).send(); // No Content 成功删除
    } else {
      console.log(`Post with id ${postId} not found in DB.`);
      res.status(404).json({ message: 'Post not found 喵!' });
    }
  } catch (error) {
    console.error('删除博客失败喵:', error);
    res.status(500).json({ message: '删除博客时发生错误 T_T' });
  }
});

// --- OpenAI 聊天代理 API ---
app.post('/chat', async (req, res) => {
  console.log('POST /chat request received 喵~');
  // 从请求体获取数据，提供默认值
  const { messages, model = 'deepseek-ai/DeepSeek-R1', temperature = 0.7, max_tokens = 2000 } = req.body; 

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: '无效的消息格式喵！' });
  }

  if (!apiKey || apiKey.startsWith('sk-***')) { // 更安全的占位符检查
     console.error('OpenAI API Key 未在服务器端配置喵!');
     return res.status(500).json({ message: '服务器未配置 AI 服务喵 T_T' });
  }

  try {
    console.log(`向 OpenAI 发送请求: model=${model}, temp=${temperature}, max_tokens=${max_tokens}`);
    const completion = await openai.chat.completions.create({
      messages: messages, 
      model: model, 
      temperature: temperature,
      max_tokens: max_tokens,
    });

    console.log('从 OpenAI 收到响应喵~');
    if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
      res.json({ completion: completion.choices[0].message.content });
    } else {
      console.error('OpenAI 返回了无效的响应结构喵:', completion);
      throw new Error('OpenAI 返回了无效的响应结构喵');
    }

  } catch (error) {
    // 记录更详细的错误信息
    console.error('调用 OpenAI API 出错喵 (｡>﹏<｡):', error.name, error.message, error.stack);
    // 尝试返回更具体的错误类型给前端（如果可能）
    let clientErrorMessage = `调用 AI 服务失败喵: ${error.message}`;
    if (error.status) { // OpenAI 库可能会附加 status
        clientErrorMessage = `调用 AI 服务失败喵 (Code: ${error.status}): ${error.message}`;
    }
    res.status(500).json({ message: clientErrorMessage });
  }
});

// --- 图片上传 API ---
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: '没有文件被上传喵，或者文件类型不被接受。' });
  }
  // 文件上传成功，返回 web 可访问的 URL
  const imageUrl = `/uploads/${req.file.filename}`; // 生成相对 URL
  console.log(`图片上传成功喵: ${req.file.filename}, URL: ${imageUrl}`);
  res.json({ success: true, imageUrl: imageUrl });
}, (error, req, res, next) => {
  // 处理 multer 可能抛出的错误 (如文件过大或类型不对)
  console.error('图片上传失败喵:', error);
  res.status(400).json({ success: false, error: error.message });
});

// --- 启动服务器 ---
async function startServer() {
  await initializeDatabase(); // 先初始化数据库
  app.listen(port, () => {
    console.log(`服务器正在 http://localhost:${port} 上运行喵~ (使用 MySQL) (ฅ^•ﻌ•^ฅ)`);
  });
}

startServer(); // 启动！ 