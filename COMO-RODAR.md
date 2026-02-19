# Como salvar tudo e rodar o site com o banco conectado

## 1. Salvar os arquivos
- No Cursor/VS Code: **Ctrl + K**, depois **S** (ou **File → Save All**).
- Ou **Ctrl + Shift + S** para salvar tudo.

## 2. Deixar o MySQL pronto (só na primeira vez)
- Abra o **XAMPP** e inicie o **MySQL**.
- Se ainda não importou o banco, no phpMyAdmin (`http://localhost/phpmyadmin`):
  - Clique em **Importar** e escolha o arquivo **arena_cedro.sql** (na raiz do projeto).
  - Ou no terminal: `mysql -u root -p < arena_cedro.sql`

## 3. Instalar dependências (se ainda não fez)
```bash
npm install
```

## 4. Rodar o site — use **dois terminais** (recomendado)
O comando `npm run run:site` pode falhar no Windows. Use dois terminais na pasta do projeto:

**Terminal 1 (backend):**
```bash
npm start
```
Espere aparecer: **✅ Conectado ao banco de dados arena_cedro** e **✅ Servidor rodando na porta 3001**.

**Terminal 2 (frontend):**
```bash
npm run dev
```
Espere aparecer o endereço local (ex.: **http://localhost:5173**).

## 5. Abrir o site
No navegador: **http://localhost:5173**

Se der **ERR_CONNECTION_REFUSED**: confira se os dois terminais estão abertos e sem erros (backend na 3001, frontend na 5173).

---

### Logins de teste (após importar o arena_cedro.sql)
| Tipo     | E-mail                        | Senha           |
|----------|--------------------------------|-----------------|
| Atendente| mariasantos@atendcedro.com     | SenhaAtend123!  |
| Admin    | carlosadmin@admincedro.com      | SenhaAdmin456!  |
