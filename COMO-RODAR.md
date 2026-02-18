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

## 4. Rodar o site (backend + frontend juntos)
No terminal, na pasta do projeto:

```bash
npm run run:site
```

Isso sobe:
- **Backend** na porta **3001** (conectado ao banco arena_cedro).
- **Frontend** na porta **5173**.

Se aparecer **✅ Conectado ao banco de dados arena_cedro** e **Servidor rodando na porta 3001**, o banco está conectado.

## 5. Abrir o site
No navegador: **http://localhost:5173**

---

### Rodar em dois terminais (alternativa)
Se preferir ver o log do backend e do frontend separados:

- **Terminal 1:** `npm start` (backend)
- **Terminal 2:** `npm run dev` (frontend)

Depois abra **http://localhost:5173**.

---

### Logins de teste (após importar o arena_cedro.sql)
| Tipo     | E-mail                        | Senha           |
|----------|--------------------------------|-----------------|
| Atendente| mariasantos@atendcedro.com     | SenhaAtend123!  |
| Admin    | carlosadmin@admincedro.com      | SenhaAdmin456!  |
