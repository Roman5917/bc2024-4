
const http = require('http');
const { Command } = require('commander');

const program = new Command();
program
    .requiredOption('-h, --host <host>', 'адреса сервера')
    .requiredOption('-p, --port <port>', 'порт сервера')
    .requiredOption('-c, --cache <cache>', 'шлях до директорії, яка міститиме закешовані файли')
    .parse(process.argv);

const options = program.opts();

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Сервер працює!');
});

server.listen(options.port, options.host, () => {
    console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
