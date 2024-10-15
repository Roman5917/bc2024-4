const http = require('http');
const fs = require('fs').promises;
const superagent = require('superagent');
const path = require('path');

const PORT = 3000;
const CACHE_DIR = path.join(__dirname, 'cache');

// Функція для формування шляху до файлів кешу
const getCacheFilePath = (code) => path.join(CACHE_DIR, `${code}.jpg`);

// Створення кешу папки, якщо її не існує
fs.mkdir(CACHE_DIR, { recursive: true });

const requestListener = async (req, res) => {
    const code = req.url.slice(1); // Отримуємо код з URL
    const filePath = getCacheFilePath(code);

    if (req.method === 'GET') {
        try {
            await fs.access(filePath);
            const image = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(image);
        } catch {
            // Якщо картинки немає в кеші, пробуємо отримати її з http.cat
            try {
                const response = await superagent.get(`https://http.cat/${code}`);
                await fs.writeFile(filePath, response.body); // Зберігаємо у кеш
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(response.body);
            } catch {
                res.writeHead(404);
                res.end('Not Found');
            }
        }
    } else if (req.method === 'PUT') {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', async () => {
            await fs.writeFile(filePath, Buffer.concat(body)); // Записуємо файл у кеш
            res.writeHead(201);
            res.end();
        });
    } else if (req.method === 'DELETE') {
        try {
            await fs.unlink(filePath); // Видаляємо файл
            res.writeHead(200);
            res.end();
        } catch {
            res.writeHead(404);
            res.end('Not Found');
        }
    } else {
        res.writeHead(405);
        res.end('Method Not Allowed');
    }
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
