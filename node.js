const express = require('express'); // 引入 Express 框架
const sql = require('mssql'); // 引入 mssql 模組，用於與 SQL 資料庫互動
const cors = require('cors'); // 用於處理跨域請求

const app = express(); // 初始化 Express 應用程式

// 中介軟體：解析 JSON 和表單資料
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 測試根路由
app.get('/', (req, res) => {
    res.send('伺服器運行正常!');
});



// 資料庫設定
const dbConfig = {
    user: 'TWconch',
    password: 'ChenPoLo25',
    server: 'MSI\\MSSQLSERVER2024', // 請確認正確的伺服器名稱
    database: 'user_conch',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

// 註冊 API
app.post('/register', async (req, res) => {
    console.log('請求到達 /register');
    console.log('接收到的請求資料:', req.body);

    const { username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        console.log('密碼與確認密碼不符');
        return res.status(400).send('密碼與確認密碼不符!');
    }

    let pool;
    try {
        console.log('嘗試連線資料庫...');
        pool = await sql.connect(dbConfig);
        console.log('資料庫連線成功');

        console.log('執行 SQL 插入語句...');
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password) // 密碼不加密直接存入
            .query(`
                INSERT INTO users (username, email, password)
                VALUES (@username, @email, @password)
            `);

        console.log('資料插入成功:', result);
        res.status(200).send('註冊成功');
    } catch (error) {
        console.error('伺服器錯誤:', error);

        if (error.originalError?.info?.number === 2627) {
            console.log('唯一性約束錯誤，帳號或電子郵件已存在');
            res.status(400).send('電子郵件或帳號已存在!');
        } else {
            console.log('未知錯誤，回傳伺服器錯誤');
            res.status(500).send('伺服器錯誤，請稍後再試');
        }
    } finally {
        if (pool) {
            pool.close();
            console.log('資料庫連線已關閉');
        }
    }
});

//登入 API
app.post('/login', async (req, res) => {
    console.log('接收到的請求資料:', req.body);
    const { username, password } = req.body;

    let pool;
    try {
        console.log('嘗試連線資料庫...');
        pool = await sql.connect(dbConfig);
        console.log('資料庫連線成功');

        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(`
                SELECT password FROM users WHERE username = @username
            `);

        console.log('SQL 查詢結果:', result.recordset);

        if (result.recordset.length === 0) {
            console.log('帳號不存在');
            return res.status(400).send('帳號不存在!');
        }

        const dbPassword = result.recordset[0].password;
        console.log('資料庫中的密碼:', dbPassword);

        if (password !== dbPassword) {
            console.log('密碼錯誤');
            return res.status(400).send('密碼錯誤!');
        }

        console.log('登入成功');
        res.status(200).send('登入成功');
    } catch (error) {
        console.error('伺服器錯誤:', error);
        res.status(500).send('伺服器錯誤，請稍後再試');
    } finally {
        if (pool) {
            pool.close();
            console.log('資料庫連線已關閉');
        }
    }
});

// 查找 API
app.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).send('請提供查詢條件!');
    }

    let pool;
    try {
        pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input('query', sql.NVarChar, `%${query}%`)
            .query(`
                SELECT id, username, email, password, FORMAT(created_at, 'yyyy-MM-dd HH:mm:ss') AS created_at
                FROM users
                WHERE username LIKE @query OR email LIKE @query
            `);

        if (result.recordset.length === 0) {
            return res.status(404).send('未找到符合的資料!');
        }

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('伺服器錯誤:', error);
        res.status(500).send('伺服器錯誤，請稍後再試');
    } finally {
        if (pool) pool.close();
    }
});

//刪除 API 
app.delete('/delete', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).send('請提供帳號!');
    }

    let pool;
    try {
        pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(`
                DELETE FROM users
                WHERE username = @username
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('帳號不存在!');
        }

        res.status(200).send('帳號刪除成功!');
    } catch (error) {
        console.error('伺服器錯誤:', error);
        res.status(500).send('伺服器錯誤，請稍後再試');
    } finally {
        if (pool) pool.close();
    }
});


// 啟動伺服器
const PORT = 3001; // 如果執行馬上結束請更換埠號
app.listen(PORT, () => {
    console.log(`伺服器啟動於 http://localhost:${PORT}`);
});
