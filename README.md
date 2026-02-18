# 🏟️ Arena Cedro - Sistema de Agendamento

Este é o portal oficial da **Arena Cedro**, o complexo esportivo de futebol society referência em São José de Ribamar - MA. Desenvolvido para oferecer uma experiência de reserva rápida, moderna e profissional.

## 📍 Sobre a Arena

A Arena Cedro combina infraestrutura de elite com a paixão pelo futebol, oferecendo um ambiente completo para o seu racha:

-   **Gramado Sintético High-Tech**: Utilizamos fibra monofilamento de polietileno com preenchimento em borracha granulada SBR. Isso garante absorção de impacto superior, preservando as articulações dos atletas e mantendo o quique da bola perfeito em qualquer condição climática. Campo 20x40m, podendo ter 14 jogadores(c/ goleiro).
-   **Iluminação LED Profissional**: Sistema de projetores LED de alta eficiência com temperatura de cor fria (5000K-6000K). Garante visibilidade total em todos os cantos do campo, eliminando áreas de sombra e permitindo gravações de vídeos com qualidade profissional à noite.
-   **Localização**: Av. Trindade, 3126, SJ de Ribamar-MA. Um ponto de fácil acesso com ambiente seguro para toda a família.

## 🚀 Funcionalidades do Sistema

-   **Agenda Flexível**: Escolha entre slots de 30, 60 ou 90 minutos com atualização dinâmica de horários.
-   **Galeria de Mídia Inteligente**: Grid que suporta fotos panorâmicas e vídeos curtos (estilo Reels) que dão vida à experiência do campo.
-   **Filtro de Depoimentos**: Sistema de segurança que limpa automaticamente palavras impróprias das avaliações dos clientes.
-   **Responsividade Total**: Interface otimizada para smartphones, facilitando o agendamento direto do vestiário ou do trabalho.

## 📜 Documentos e Regras

Para garantir a melhor convivência e durabilidade do nosso gramado, todos os usuários devem seguir nossas diretrizes:

-   [📄 **Regras de Uso da Arena (PDF)**](./regras-arena.pdf) - *Consulte sobre calçados permitidos, cancelamentos e normas de conduta.*

## 🗄️ Banco de dados (MySQL)

O site usa o banco **arena_cedro**. Para conectar:

1. **Importe o schema** no MySQL (XAMPP, phpMyAdmin ou linha de comando):
   ```bash
   mysql -u root -p < arena_cedro.sql
   ```
   Ou no phpMyAdmin: criar banco `arena_cedro` e importar o arquivo `arena_cedro.sql` da raiz do projeto.

2. **Configure o servidor** (opcional): copie `.env.example` para `.env` e ajuste se precisar:
   - `DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD=`, `DB_NAME=arena_cedro`

3. **Inicie o backend**: `npm start` (porta 3001). Você deve ver: `✅ Conectado ao banco de dados arena_cedro`.

**Usuários de teste** (após importar o SQL):
- Atendente: `mariasantos@atendcedro.com` / `SenhaAtend123!`
- Admin: `carlosadmin@admincedro.com` / `SenhaAdmin456!`
- Cliente: `joao@email.com` / `Senha123!`

## 🛠️ Tecnologias Utilizadas

-   **React + TypeScript** (Front-end robusto)
-   **Tailwind CSS** (Design moderno e Dark Mode)
-   **Lucide React** (Iconografia técnica)
-   **Shadcn/UI** (Componentes de alta fidelidade)
-   **Node.js + Express + MySQL** (Back-end e banco)

## 🔧 Estrutura de Pastas de Mídia

Certifique-se de que os arquivos abaixo estão em `/public/media/`:

-   `campo-1.jpg`, `campo-2.jpg`, `campo-4.jpg` (Fotos verticais)
-   `campohorizontal-3.jpg` (Vista panorâmica)
-   `video-1.mp4` até `video-6.mp4` (Destaques em vídeo)
-   `regras-arena.pdf` (Manual de normas da arena)

---
### 📞 Contato e Reservas
- **WhatsApp**: (98) 99991-0535
- **Instagram**: [@arenacedrofut7](https://www.instagram.com/arenacedrofut7/)

**"Onde o racha vira espetáculo."** ⚽🏆