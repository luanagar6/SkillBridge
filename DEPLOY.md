# Deploy em grupo-404.ifsp.dev

## Pré-requisitos no servidor
- Node.js v18+
- npm

## Passos de Deploy via SSH (PuTTY)

### 1. Copiar arquivos para o servidor
```bash
# No seu PC (PowerShell):
pscp -r "C:\Users\bruno\Downloads\abc\SkillBridge\*" usuario@grupo-404.ifsp.dev:/caminho/deploy/
```

### 2. Conectar via SSH (PuTTY)
```bash
ssh usuario@grupo-404.ifsp.dev
```

### 3. No servidor remoto
```bash
cd /caminho/deploy
npm install
npm run build
npm start
```

### 4. (Opcional) Usar PM2 para manter rodando
```bash
npm install -g pm2
pm2 start server.js --name "skillbridge"
pm2 startup
pm2 save
```

## Configuração de Domínio
- A aplicação rodará em `http://localhost:3000` no servidor
- Configure um reverse proxy (Nginx/Apache) para `https://grupo-404.ifsp.dev/`

### Exemplo Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name grupo-404.ifsp.dev;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Variáveis de Ambiente (.env)
```
NODE_ENV=production
PORT=3000
```
