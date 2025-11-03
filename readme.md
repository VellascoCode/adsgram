AdsGram – Plataforma de Anúncios e Tarefas Recompensadas (MVP)
Visão Geral do Projeto
AdsGram é uma plataforma integrada ao Telegram (com possibilidade futura de expansão para web e WhatsApp) que permite aos usuários ganhar recompensas em criptomoedas (inicialmente USDT) ou em reais via Pix ao visualizar anúncios e realizar tarefas promocionais. O aplicativo funciona como um bot do Telegram com uma Mini App Web: ao iniciar o bot, o usuário acessa uma interface web interativa dentro do Telegram, sem precisar sair do app. Nessa interface, ele poderá ver anúncios (ex.: banners ou vídeos curtos) e completar tarefas (ex.: entrar em grupos, cadastrar-se em apps, etc.) em troca de recompensas. O sistema terá dois tipos de usuário:
Usuário final, que consome anúncios/tarefas e ganha créditos.
Administrador/anunciante, que gerencia as campanhas (anúncios e tarefas), verifica as conclusões e gerencia pagamentos.
O foco deste MVP é construir a base funcional do AdsGram, com experiência fluida no Telegram, design atrativo usando Tailwind CSS, e garantindo que cada componente e página estejam bem estruturados e explicados (visando facilitar futura geração de código automatizada via Codex).
Funcionalidades Principais
Login Automático via Telegram: Quando o usuário inicia o bot e abre a mini-app do AdsGram no Telegram, ele é autenticado automaticamente usando sua conta Telegram (ID, nome, etc.), sem necessidade de login manual. Isso aproveita a API de autenticação do Telegram para identificar de forma segura o usuário
core.telegram.org
. A integridade dos dados de login fornecidos pelo Telegram é verificada via HMAC-SHA256 com o token do bot, conforme a especificação do Login Widget do Telegram
core.telegram.org
.
Perfil do Usuário: Cada usuário tem um perfil onde serão armazenados: nickname (pré-preenchido a partir do nome de usuário do Telegram), avatar (pode ser importado do Telegram ou escolhido/upload pelo usuário), email de contato, carteira de criptomoeda (endereço MetaMask/Ethereum para receber USDT) e chave Pix (para saques em BRL), além de informações de localização básica (país/estado/cidade). Na primeira vez que acessar o app, o usuário verá um formulário para completar esses dados de perfil. O avatar padrão pode usar a foto do Telegram (caso disponível)
core.telegram.org
, mas o usuário pode alterar se desejar.
Preferências de Anúncios e Tarefas: Durante o onboarding (cadastro inicial) ou a qualquer momento no perfil, o usuário pode selecionar categorias de anúncios que deseja ver e tipos de tarefas que prefere realizar. Disponibilizaremos 15-20 categorias de anúncios (por exemplo: Adulto, Criptomoedas, Games, Tecnologia, Finanças, Saúde, Educação, Entretenimento, Viagens, Gastronomia, Moda, etc.) e cerca de 10 tipos de tarefas (por exemplo: Visualizar vídeo, Visitar site, Entrar em grupo Telegram, Entrar em grupo WhatsApp, Cadastrar-se em aplicativo/website, Responder pesquisa, Seguir perfil em rede social, Baixar aplicativo, Compartilhar conteúdo, Completar quiz, etc.). Essas preferências ajudarão a personalizar o conteúdo exibido para cada usuário, mostrando primeiro as ofertas que coincidem com seus interesses.
Visualização de Anúncios: Os usuários podem navegar por uma lista de anúncios disponíveis de acordo com suas preferências. Cada anúncio exibirá informações como título, categoria, recompensa oferecida (ex.: USDT 0.01 por visualização) e talvez uma prévia. Ao clicar em “Ver Anúncio”, abre-se um modal elegante (animado com motion) mostrando o conteúdo do anúncio. O anúncio pode ser, por exemplo, um vídeo curto do YouTube ou uma imagem/banner com link. O usuário deve permanecer com o anúncio aberto por 10 segundos (um contador regressivo será exibido). Após os 10 segundos, a visualização é considerada completa e o usuário ganha a recompensa daquela propaganda. O sistema registra no banco de dados que o usuário X viu o anúncio Y naquele dia. Cada anúncio só pode ser contabilizado uma vez por dia por usuário – se o usuário tentar ver novamente o mesmo anúncio no mesmo dia, não receberá outra recompensa (o app pode ocultar ou desabilitar anúncios já vistos naquele dia). Assim, no dia seguinte, o mesmo anúncio poderia ser exibido novamente se ainda estiver ativo e com saldo, dando oportunidade de nova remuneração diária.
Tarefas Promocionais: Além de anúncios passivos, os usuários podem realizar tarefas ativas que anunciantes propõem. A lista de tarefas disponíveis também será exibida na interface (provavelmente separada da lista de anúncios, ou em abas “Anúncios” e “Tarefas”). Cada tarefa terá um título (ex.: “Entre no grupo X”, “Cadastre-se no site Y”), uma breve descrição do que deve ser feito, a recompensa em caso de conclusão e possivelmente um indicativo de categoria/tipo. Ao clicar “Iniciar Tarefa”, o usuário verá um modal com instruções detalhadas da tarefa e talvez um botão/link externo:
Por exemplo, se a tarefa é “Entrar no grupo Telegram ABC”, o modal pode mostrar um botão que ao clicar abre o grupo no Telegram (via deep link tg:// ou link externo) para o usuário ingressar. Após ingressar, o usuário volta ao AdsGram e clica em “Concluí tarefa”.
Se a tarefa é “Cadastrar-se no aplicativo XYZ”, o modal pode exibir um link para o site/app e instruções do que precisa ser feito (ex.: usar um código de referência). Depois de realizar, o usuário marca como concluído.
Em alguns casos, pode haver um campo para o usuário enviar prova (por exemplo, um código de confirmação, um screenshot, ou informar o username com que se cadastrou). No MVP, para simplificar, podemos não exigir upload de arquivos – talvez apenas um campo de texto se necessário para provas simples.
Após o usuário marcar a tarefa como concluída, o sistema registra a conclusão como “pendente de verificação”. A recompensa não é creditada imediatamente até que um admin confirme que a tarefa foi realmente cumprida. Essa verificação pode ser manual no MVP: o administrador verá a lista de tarefas pendentes e validará cada uma (por exemplo, conferindo se o usuário está no grupo, ou se aparece no sistema externo). Quando o admin aprova, a recompensa é creditada na conta do usuário.
Saldo e Recompensas: Cada usuário possui um saldo de ganhos em sua conta AdsGram, calculado em tempo real. Quando um anúncio é visualizado ou uma tarefa é aprovada, o valor correspondente em recompensa é adicionado ao saldo do usuário. No MVP, todo valor será armazenado em uma unidade (poderíamos usar USDT como padrão ou pontos internos equivalentes). Se houver recompensas em BRL separadamente, poderíamos ter saldos distintos ou converter tudo para um só (para simplificar, podemos armazenar tudo como saldo em USDT, e no momento do saque em BRL Pix fazer a conversão). O usuário pode ver seu saldo atual em algum lugar da interface (por exemplo, no topo ou menu do aplicativo, mostrando algo como “Saldo: 2.50 USDT”). Também haverá uma página ou seção de Histórico de ganhos, mostrando cada anúncio/tarefa concluída com sua data e valor creditado.
Sistema de Saque (Withdraw): Os usuários podem requisitar saque de seus ganhos quando atingirem um mínimo estabelecido. Para o MVP, definimos valor mínimo de saque de 3 USDT ou R$20,00 (via Pix). Ou seja, se o usuário escolheu receber em criptomoeda, precisará ter pelo menos 3 USDT acumulados; se optou por Pix (BRL), pelo menos R$20. Na interface, haverá um botão “Solicitar Saque” na área de saldo/financeiro.
Se o usuário tem saldo suficiente, ele escolhe o método de pagamento (exibir opções: Crypto (USDT) ou Pix (R$) – possivelmente só mostrar as opções para as quais ele cadastrou endereço/chave).
Para USDT, utilizaremos o endereço de carteira (wallet) fornecido no perfil (campo MetaMask/Ethereum address). Para Pix, utilizaremos a chave Pix cadastrada (que pode ser e-mail, telefone ou chave aleatória, conforme o usuário informou).
Ao confirmar a solicitação, criamos um registro de saque pendente. O saldo do usuário pode ser congelado ou deduzido nesse momento (ex: mover para um campo "em processamento") para não gastar duas vezes.
Um administrador então processará manualmente o pagamento: no caso de USDT, enviando a transferência on-chain para o endereço; no caso de Pix, realizando um pagamento Pix manual ou via API bancária (no MVP provavelmente manual).
Após realizar o pagamento externo, o admin marca a solicitação como concluída/paga, e o saldo é efetivamente deduzido da conta do usuário (se já não foi) e a transação é registrada como finalizada.
Se possível, o usuário recebe uma notificação (via bot Telegram ou email) de que seu saque foi realizado. No MVP, uma forma simples é o admin enviar uma mensagem pelo próprio bot do Telegram ao usuário confirmando o pagamento, ou o status aparecer no histórico do usuário.
Interface Intuitiva e Design Atraente: A experiência do usuário será otimizada para mobile (dado que Telegram é majoritariamente móvel). Usaremos Tailwind CSS para rapidamente estilizar uma interface moderna e limpa, seguindo as diretrizes de design do Telegram (cores e estilo nativo quando possível)
core.telegram.org
. A interface terá:
Um layout principal com talvez um cabeçalho mostrando o nome do app e saldo do usuário, e corpo com as listas de anúncios/tarefas.
Botões claros para as ações principais (“Ver Anúncio”, “Iniciar Tarefa”, etc.) possivelmente com ícones indicadores.
Uso de Framer Motion (lib motion do framer) para animações suaves: por exemplo, transição de telas, abertura de modais deslizando da lateral ou de baixo, feedbacks visuais após 10s (um checkmark animado quando completa um anúncio, etc.), tornando a experiência mais dinâmica e agradável (almejando 60fps em animações)
core.telegram.org
.
Suporte a modo claro/escuro automaticamente, respeitando as preferências de tema do Telegram. A API do Telegram WebApp fornece parâmetros de tema (cores de fundo, texto etc.) que podemos usar para ajustar o tema do nosso app automaticamente para ficar consistente dentro do Telegram
core.telegram.org
.
Responsividade: apesar de ser pensado para mobile dentro do Telegram, a aplicação web também deve se ajustar bem em diferentes tamanhos de tela (caso abrirem no desktop ou navegador externo). Usaremos abordagem mobile-first CSS.
Administração (Backoffice): Haverá uma interface de admin embutida no mesmo projeto (acessível via um caminho restrito, ex: /admin). Essa interface permite aos administradores:
Visão geral (dashboard) de estatísticas: número de usuários cadastrados, total de anúncios ativos, tarefas pendentes para aprovar, saldo total a pagar, etc.
Gerenciar Anúncios: criar novos anúncios ou encerrar anúncios. Um formulário para o admin inserir: título do anúncio, categoria, tipo de mídia (URL de vídeo/imagem ou texto), duração de visualização requerida (padrão 10s), recompensa por visualização (ex: 0.01 USDT) e orçamento total (quanto o anunciante está pagando em total, ex: 10 USDT, que equivalem a 1000 visualizações de 0.01). Com base no orçamento e recompensa, podemos calcular quantas visualizações estão disponíveis. Após criar, o anúncio fica ativo e visível aos usuários até atingir o número máximo de visualizações (ou até a data de expiração, se definirmos, mas inicialmente orçamento). O admin também pode pausar/desativar anúncios manualmente.
Gerenciar Tarefas: semelhante aos anúncios, criar tarefas definindo: título, descrição/instruções, categoria/tipo, recompensa por conclusão (ex: 0.50 USDT), quantidade máxima de conclusões (ou orçamento total). Poderia incluir campos como link de referência ou código, dependendo da tarefa. Ex: para "entrar em grupo Telegram", fornecer o link de convite do grupo; para "cadastrar no app X", talvez fornecer um código ou link de afiliado.
Aprovar/Negar Conclusões: Uma seção para revisar tarefas concluídas pelos usuários. Listar as submissões pendentes com detalhes (usuário, tarefa, talvez evidências ou info enviada). O admin verifica e então marca cada uma como aprovada (o que credita a recompensa ao usuário) ou negada (o usuário não recebe, e possivelmente podemos registrar o motivo). Idealmente, ao aprovar/negar, o bot pode enviar uma mensagem ao usuário automaticamente informando o resultado da tarefa (isso seria um bônus; no MVP pode ficar sem notificação automática ou via mensagem manual).
Gerenciar Usuários: Lista de usuários cadastrados com seus dados básicos (ID Telegram, nome, email, saldo, etc.). Permitir pesquisar usuário, ver detalhes incluindo histórico de tarefas/anúncios feitos, e possivelmente ajustar saldo manualmente se necessário (por exemplo, corrigir algum bug ou conceder bônus). Também poderia permitir bloquear usuários (excluir ou marcar como banido) se detectado fraude.
Processar Saques: Tela listando solicitações de saque pendentes. Para cada solicitação, mostrar usuário, valor, método (USDT ou Pix) e dados necessários (endereço wallet ou chave Pix). O admin após enviar o pagamento clica em “Marcar como Pago”, e o sistema registra a hora do pagamento e finaliza aquela solicitação. Talvez enviar um email ou Telegram message de confirmação ao usuário. Além disso, uma lista de saques já efetuados para histórico.
Autenticação Admin: O acesso à área admin será protegido. Implementaremos isso usando NextAuth com um Credentials Provider customizado que valida um PIN de 4 dígitos como senha de admin. Ou seja, ao acessar /admin, será exibida uma tela de login solicitando um PIN de 4 dígitos. Apenas quem souber o PIN correto conseguirá entrar (no futuro poderia ser multiplos admins com seus logins, mas MVP basta um PIN compartilhado ou único). Se o PIN inserido estiver errado, o sistema deve aguardar 15 segundos antes de permitir nova tentativa, como medida antitentativa (rate limiting básico). Usando NextAuth com credenciais customizadas, conseguimos definir nossa lógica de autorização facilmente
next-auth.js.org
next-auth.js.org
. Uma vez autenticado, a sessão admin permanece (podemos usar JWT para sessão). Observação: como NextAuth credencial não armazena usuários por padrão, podemos simplesmente comparar o PIN com uma variável de ambiente ou hash fixo. Essa abordagem simples é para o MVP; no futuro, trocar para um sistema de usuários admin adequados.
A interface admin também usará Tailwind para manter consistência, mas pode ser mais desktop-friendly (já que admins podem preferir acessar via computador).
Gamificação e Engajamento (Melhorias Futuros): Queremos que o uso do AdsGram seja motivador. Algumas ideias de gamificação que podemos incluir:
Sistema de Níveis: Usuários ganham experiência ou pontos a cada anúncio/tarefa completada. Ao acumular, sobem de nível (por exemplo, iniciar no Nível 1 e ir subindo). Níveis poderiam ser meramente ilustrativos ou desbloquear algum benefício (como acesso a tarefas VIP ou maior porcentagem de ganho). No MVP, podemos ao menos calcular um nível simples baseado no total ganho ou total tarefas feitas.
Conquistas/Badges: Metas como “10 anúncios vistos”, “Ganhos de 5 USDT acumulados”, “7 dias consecutivos ativo” poderiam render badges virtuais exibidos no perfil do usuário. Isso incentiva o engajamento contínuo. Implementar totalmente pode ser complexo, mas podemos planejar.
Ranking/Leaderboard: Mostrar os top usuários (quem mais ganhou, ou mais tarefas fez) em um ranking mensal. Isso cria competitividade saudável. No MVP podemos deixar preparado, mas depende de ter usuários suficientes.
Sistema de Indicação (Referral): Usuários podem ter um código/link de convite. Se novos usuários se cadastrarem por ele, o padrinho ganha uma bonificação (ex: 5% dos ganhos do indicado, ou um bônus fixo quando o indicado atinge X ganhos). Esse mecanismo impulsiona o crescimento. Para MVP, mencionamos como possibilidade futura; se houver tempo, implementar ao menos o armazenamento do código de referência e vínculo entre usuários.
Notificações e Comunicação: Integrar mensagens do bot para engajar: por exemplo, o bot Telegram pode enviar diariamente uma mensagem ao usuário com “Novas tarefas disponíveis” ou “Você não concluiu nenhuma tarefa hoje, há anúncios esperando por você!”. Esse tipo de push aumenta retenção. No MVP talvez limitamos a comunicações necessárias (como confirmações de saque, etc.), mas mantemos em mente para expandir.
Branding: O nome AdsGram remete a anúncios + Telegram. Podemos criar um logo simples combinando ícones de chat/telegram e dinheiro/anúncio. As cores do app podem se inspirar no Telegram (azul) junto com tons que remetam a confiança e dinheiro (verde, talvez). Uma identidade visual consistente ajuda na confiança do usuário. Todos os textos do app devem ter um tom amigável e motivador. Ex.: em vez de “Tarefa concluída”, usar algo como “Parabéns! Você ganhou X por concluir a tarefa.”, etc.
Figura: Tela de confirmação do Telegram Login Widget, exibida quando o usuário autoriza o uso da sua conta Telegram no aplicativo web. Após o usuário clicar em "Log in", o Telegram mostra uma janela de confirmação como esta, garantindo que o usuário dê permissão para compartilhar seu nome de usuário, nome e foto de perfil com o AdsGram. Esse processo simplifica o cadastro, aproveitando a identidade já verificada do Telegram.
Tecnologias e Arquitetura da Solução
Frontend: Será desenvolvido em Next.js 13+ com TypeScript. Usaremos o sistema de páginas (pages/) do Next para facilitar a separação de rotas (devido à necessidade de ter páginas específicas como index, indexlocal, admin, etc., e integração fácil com NextAuth). O uso de TypeScript garante maior segurança de tipos, evitando muitos erros comuns. A camada de estilo será construída com Tailwind CSS, permitindo rápida prototipação de um design responsivo e moderno. Adicionaremos também a biblioteca Framer Motion (framer-motion) para animações declarativas de alta qualidade (ex.: transições de modais, listas aparecendo, etc.). Para ícones e pequenos componentes de UI, podemos usar bibliotecas como Heroicons (já compatível com Tailwind) ou FontAwesome, ou importar SVGs conforme necessidade. Backend/API: Next.js permitirá implementar a API do backend via rotas API (pages/api/* ou novas app/api routes). Essas rotas serão usadas para operações como:
Registrar visualização de anúncio (ex.: POST /api/ads/view).
Registrar conclusão de tarefa (ex.: POST /api/tasks/submit).
Solicitar saque (ex.: POST /api/withdraw).
Ações de admin: aprovar tarefa, aprovar saque, criar anúncio/tarefa, etc. (ex.: POST /api/admin/approveTask, POST /api/admin/newAd etc.). Essas rotas terão verificação de autenticação admin (via NextAuth session) para segurança.
Banco de Dados: Optamos por um banco de dados relacional (SQL) para melhor estruturar as relações entre usuários, anúncios, tarefas, etc. Especificamente, utilizaremos o PostgreSQL serverless através do serviço Neon (integrado à Vercel). O Neon oferece um Postgres gerenciado com ótima performance e escalabilidade, no modelo serverless com autoscaling e inclusive suspensão automática quando não está em uso (economizando recursos)
vercel.com
. Além disso, possui um plano gratuito generoso que atende ao MVP e pode crescer conforme a demanda
vercel.com
. A integração com Vercel é nativa, permitindo fácil criação de instâncias e até branches de banco para cada preview, se necessário. Sobre acesso ao DB no código, usaremos o Prisma ORM por produtividade e segurança: o Prisma facilita definir modelos de dados e realizar consultas em TS com auto-complete. Ele também se integra bem com Next.js e Neon. (Obs: Como alternativa, poderíamos usar Supabase – que é Postgres + BaaS – mas para nossa necessidade, Neon focado apenas no Postgres é suficiente e mais leve
bytebase.com
). Telegram Integration: Para integrar o Next.js app ao Telegram, usaremos as capacidades de Telegram Bots e Web Apps (Mini Apps). Teremos um bot criado via BotFather, vinculado ao domínio onde o app estará hospedado (configurado via /setdomain no BotFather). Há duas maneiras que podemos combinar:
Telegram WebApp (Mini App): O bot pode enviar ao usuário um botão especial que abre uma URL dentro do Telegram (usando a classe WebApp). Quando aberto desse modo, o Telegram fornece ao nosso app informações de contexto do usuário (como id, first_name, etc.) através de window.Telegram.WebApp.initData. Usaremos o SDK/objeto JS do Telegram para obter esses dados no front-end e então validar no backend. Esse método permite experiência fluida, pois o usuário nem percebe um “login” – a identidade Telegram já está presente
medium.com
. Também podemos aproveitar métodos como Telegram.WebApp.sendData se quisermos enviar dados de volta ao bot, embora no MVP isso não seja estritamente necessário
core.telegram.org
.
Telegram Login Widget: Alternativamente ou adicionalmente, podemos incluir o Telegram Login Widget tradicional, que renderiza um botão "Log in with Telegram". Ao clicar, o Telegram pede autorização e redireciona de volta com os dados do usuário e um hash de verificação
core.telegram.org
. Esse fluxo é útil para acesso via navegadores externos (fora do Telegram). No MVP, priorizaremos o Mini App (pois pretendemos que os usuários usem dentro do Telegram mesmo), mas poderemos também ter suporte a login widget caso alguém acesse a URL fora do Telegram.
De qualquer forma, no backend implementaremos a verificação de segurança recomendada pelo Telegram: calcular o hash HMAC-SHA256 dos dados recebidos usando a secret key (SHA256 do token do bot) para confirmar que os dados não foram adulterados
core.telegram.org
. Somente então consideraremos o usuário autenticado. Após autenticado, podemos criar uma sessão para o usuário (por exemplo, gerar um JWT ou usar a sessão do NextAuth) de modo que as requisições subsequentes identifiquem o usuário logado. WhatsApp (futuro): Integrar de forma semelhante no WhatsApp Web/App é mais desafiador porque o WhatsApp não oferece um equivalente ao Telegram WebApp. Uma ideia seria ter um web fallback: ou seja, usuários vindos de WhatsApp recebem um link para acessar uma versão web do AdsGram (fora do Telegram). Nesse caso, teríamos que oferecer um meio de login alternativo – talvez login por número de telefone (via OTP) ou até usar o Telegram Login se eles tiverem conta Telegram. No MVP, não implementaremos login via WhatsApp; porém, deixaremos a estrutura preparada para que a interface possa rodar no navegador (rota /web ou similar) e, nesse cenário, exigir um login (podemos reutilizar o NextAuth para permitir login por email e PIN, por exemplo, para usuários sem Telegram). Isso será considerado numa fase posterior. Estrutura de Pastas e Deploy: O projeto Next.js será chamado ads-gram e versionado no GitHub (já integrado ao VSCode do usuário). A estrutura principal esperada:
/pages – conterá as páginas React principais:
index.tsx (página inicial para Telegram app),
indexlocal.tsx (página inicial alternativa para testes locais),
profile.tsx (página de completar perfil, se não for modal),
admin/* (subpastas ou arquivos para admin dashboard e subpáginas),
API routes em /pages/api para as ações backend.
/components – componentes reutilizáveis do React (Cards, Modals, Layouts, etc.).
/styles – estilos globais/tailwind (e.g. input tailwind base).
Config files: tailwind.config.js, next.config.js, etc.
prisma/schema.prisma – definição do modelo do banco de dados.
.env.local – contendo configurações sensíveis (string de conexão do DB Neon, token do bot Telegram, etc.).
README.md – conterá a documentação (pode ser este texto adaptado), plus instruções de execução.
andamento.md – um arquivo de acompanhamento do desenvolvimento, onde o Codex ou desenvolvedor irá documentar passo a passo as implementações feitas, para rastreabilidade.
O app será implantado na Vercel (que oferece domínio e HTTPS fácil, necessário para Telegram WebApp). Na Vercel, instalaremos a integração do Neon Postgres com um clique, obtendo a URL de conexão. O bot Telegram terá o domínio configurado para permitir a WebApp e possivelmente a URL de login (Whitelist no BotFather).
Modelagem de Dados (Database)
Definiremos os modelos principais do banco de dados relacionais (Postgres) para suportar as funcionalidades:
Usuários (Users): armazena dados do usuário final.
id: identificador interno (UUID ou auto-increment).
telegramId: ID do usuário no Telegram (número). Único por usuário (usaremos para login).
telegramUsername: o @username do Telegram, se existir.
name: nome (primeiro nome ou nome completo do Telegram).
avatarUrl: URL da foto de perfil (pode ser armazenado se pegarmos do Telegram, ou um upload guardado em algum storage; no MVP, talvez não armazenar a imagem em si, apenas talvez link pro Telegram se disponível).
email: email do usuário (opcional, mas solicitado).
walletAddress: endereço da carteira crypto (string, opcional se usuário preferir Pix).
pixKey: chave Pix (string, opcional se usuário preferir crypto).
country, state, city: localização (strings).
preferredCategories: lista/array de categorias de anúncio selecionadas (poderia ser uma relação N:N com tabela de categorias, mas para simplicidade talvez guardamos uma lista separada por vírgula ou JSON).
preferredTaskTypes: similar acima, tipos de tarefa preferidos.
balance: saldo atual em USD (poderíamos armazenar em centavos ou em decimal). Este saldo seria o disponível para saque.
pendingBalance: opcional, para rastrear ganhos pendentes (por exemplo, recompensas de tarefas ainda não aprovadas pelo admin).
createdAt, updatedAt: timestamps.
isAdmin: booleano para marcar se é admin (no MVP podemos não usar, já que admin login é separado por PIN, mas podemos marcar manualmente algum usuário como admin no banco se quisermos que determinados telegramIDs tenham permissões).
Anúncios (Ads): representa uma campanha de anúncio pago por visualização.
id: identificador do anúncio.
title: título ou nome do anúncio.
category: categoria do anúncio (string ou id referência de tabela de categoria).
mediaType: tipo de mídia (e.g. "video", "image", "html") para sabermos como exibir.
mediaUrl: URL do vídeo ou imagem, ou código embed. Ex: link YouTube ou link de imagem/banner.
targetUrl: (opcional) URL de destino se o anúncio for clicável (ex.: site do anunciante).
duration: tempo em segundos que precisa ficar na tela (padrão 10).
reward: recompensa em USDT (ou nossa unidade interna) por visualização válida.
budget: orçamento total alocado (em USDT).
viewsCount: total de visualizações já realizadas.
isActive: bool (se o anúncio está ativo ou pausado).
Campos auxiliares: createdAt, createdBy (quem cadastrou, se quisermos), etc.
A quantidade de visualizações restantes pode ser derivada: remainingViews = floor(budget / reward) - viewsCount se considerarmos budget como total a pagar. Ou armazenar explicitamente um campo remainingBudget que diminui a cada view.
Quando remainingViews chega a zero, o anúncio pode se marcar automaticamente como inativo (todo budget esgotado).
Tarefas (Tasks): representa uma campanha de tarefa.
id: identificador da tarefa.
title: título da tarefa.
description: descrição detalhada/instruções.
type: tipo de tarefa (ex.: "join_telegram_group", "signup_website", etc., podemos padronizar alguns códigos).
category: categoria (pode reutilizar categorias de anúncio, ou se não fizer sentido, ter categorias próprias – mas provavelmente usam as mesmas categorias temáticas).
reward: recompensa por conclusão (USDT ou pontos).
maxCompletions: número máximo de vezes que a tarefa pode ser concluída (ex.: se anunciante só precisa de 100 pessoas no grupo, depois disso não paga mais).
completionsCount: quantas conclusões já validadas.
isActive: se está disponível.
link: (opcional) link externo relevante (ex.: link de convite, link do app).
code: (opcional) código de referência ou promo a ser usado, para mostrar ao usuário.
createdAt, createdBy: meta.
O budget aqui poderia ser implícito via maxCompletions * reward, similar ao anúncio.
Visualizações de Anúncio (AdViews): para rastrear quais usuários viram quais anúncios e quando.
id, userId, adId, viewDate (timestamp).
Poderíamos não precisar de id auto, mas uma chave composta (userId+adId+date) para garantir unicidade diária.
Cada registro indica que o usuário completou a visualização do anúncio. Poderia ter um campo credited boolean para marcar se já creditou o valor. No MVP, provavelmente creditamos imediatamente ao criar o registro, então sempre credited=true.
Utilizado para evitar duplicar visualização no mesmo dia e para histórico.
Conclusões de Tarefa (TaskCompletions): registro das tarefas feitas por usuários.
id, userId, taskId.
submissionDate.
status: "pending", "approved", "rejected".
proof: campo de evidência fornecida (texto, se houver).
approvedAt, approvedBy: se aprovado, quem e quando.
Esse registro, quando aprovado, aciona crédito de recompensa para o usuário.
Também serve para evitar o mesmo usuário repetir a mesma tarefa (provavelmente cada tarefa só pode ser feita uma vez por usuário, então podemos enforçar unicidade userId+taskId para status aprovado/pending).
Withdrawals (Saques): solicitações de saque dos usuários.
id, userId.
requestDate.
amount (valor em USDT ou BRL – talvez armazenar tudo em uma moeda padrão, ex USD).
method: "USDT" ou "PIX".
pixKeySnapshot: armazenar a chave Pix usada (caso o usuário altere no perfil depois, temos o que ele solicitou).
walletAddressSnapshot: similar para crypto.
status: "pending", "paid", "cancelled".
paidAt, paidBy: se pago, registro de data e admin.
txId: (opcional) se for crypto, o ID da transação on-chain; se Pix, talvez um código de confirmação ou apenas não aplicável.
Observação: Snapshots dos dados de pagamento são úteis para registro histórico, embora possamos confiar que no perfil não mude com frequência, mas por segurança.
(Opcional) Admins: Poderíamos ter tabela Admin separado com login e senha. Contudo, dado que adotamos o PIN fixo via NextAuth, não é obrigatório. Mas podemos criar um registro de admin na tabela Users (isAdmin flag) se quisermos vincular a um Telegram user; porém nosso admin login não usa Telegram login, é manual. No MVP, manter simples: talvez não ter tabela admins explícita.
(Opcional) Categorias e Tipos: se quisermos modelar categorias de anúncios/tarefas e tipos de tarefa em tabelas próprias (para fácil adição/edição), poderíamos ter:
Tabela AdCategory (id, name, active).
Tabela TaskType (id, name, description).
Mas inicialmente, como serão praticamente fixas e poucas, podemos codificar as listas no frontend/admin ao invés de em tabela. Fica como possível extensão.
No desenvolvimento, usaremos Prisma Migrate para criar essas tabelas no Neon. O Prisma nos permitirá também definir relações (ex.: User e AdViews, etc.). Assim, no código poderemos fazer consultas como: “buscar tarefas ativas que o user X ainda não completou e estão dentro das categorias preferidas dele” de forma relativamente simples.
Fluxo de Funcionamento (User Journey)
Para clarificar a experiência, vamos descrever um fluxo típico de um usuário normal:
Início no Telegram: O usuário encontra o bot AdsGram no Telegram (por ID ou link). Clica em “Start” no bot. O bot envia uma mensagem de boas-vindas possivelmente com um botão “Abrir AdsGram”. Esse botão é do tipo web_app que abre a URL da nossa aplicação (por exemplo, https://adsgram.vercel.app/ dentro do próprio Telegram).
Autenticação Transparente: Ao carregar a página index.tsx dentro do WebApp do Telegram, nosso frontend obtém imediatamente os dados de contexto do Telegram (fornecidos via initData). Se for a primeira vez que vemos aquele telegramId em nosso banco, criamos automaticamente um novo usuário. Podemos chamar uma API /api/auth/telegram passando os dados recebidos (id, nome, etc. e o hash de autenticação). O backend verifica o hash com segredo do bot
core.telegram.org
; estando ok, registra o usuário no banco (ou atualiza se já existe, atualizando nome/username se mudaram) e cria uma sessão para ele (por exemplo, gerando um JWT ou criando cookie de sessão). A resposta pode retornar um token de sessão ou setar cookie. A partir daí, o usuário está logado no nosso sistema sem ter feito nenhum passo manual.
Preenchimento do Perfil (Onboarding): Após login, o aplicativo detecta campos essenciais faltando (email, carteira, pix, etc.). Então redirecionamos ou mostramos um modal de completar perfil. Nesta etapa, o usuário vê um formulário onde:
Seu Nickname já aparece preenchido (podemos usar telegramUsername se existe, senão o first_name).
Avatar: se temos URL da foto do Telegram e a API nos permite acessá-la (Telegram fornece photo_url se o usuário permite
core.telegram.org
), podemos mostrar essa foto e perguntar se deseja mantê-la ou enviar outra. Implementar upload de imagem no MVP talvez seja complexo (precisaríamos de um storage, ex Vercel Blob ou S3). Alternativamente, podemos permitir escolher entre algumas avatares default. Simplicando: usar a do Telegram se disponível, senão um placeholder, e deixar mudança de avatar como melhoria futura.
Email: campo de email (podemos torná-lo opcional, mas seria útil para comunicação fora do Telegram, recuperação de conta se necessário, etc.).
Wallet (USDT): campo para endereço de carteira (texto). Instruir que deve ser endereço na rede X compatível com USDT (por ex, Tron/TRC20 ou Ethereum/ERC20 – precisamos definir qual rede; podemos supor ERC20 por usar MetaMask, embora taxas Ethereum sejam altas. Talvez BSC ou Tron seriam melhores para taxa zero; mas manter simples: pedir endereço ERC20 e avisar sobre taxas).
Chave Pix: campo para chave Pix (pode ser CPF, e-mail, telefone ou aleatória). Talvez deixar um dropdown ou detectar pelo formato, mas MVP podemos aceitar qualquer string.
Localização: selecionar país (pode ser um dropdown list extenso; ou inferir pelo código do telefone via Telegram? Telegram não dá país diretamente, só talvez linguagem local do interface). Para MVP, pode ser apenas campos livres ou um dropdown curto (ex: focar Brasil, e ter opção Outros).
Preferências de Categorias: uma lista de checkboxes ou tags para as ~15 categorias. O usuário marca as que ele tem interesse (ele pode marcar todas se quiser também). Isso definirá que tipos de anúncio aparecerão mais.
Preferências de Tarefas: outra lista de checkboxes para tipos de tarefa que gostaria (ex.: se a pessoa não quer tarefas de “adulto” ou “baixar app”, ela desmarca).
Botão Confirmar/Salvar – valida preenchimento (mínimo: ou wallet ou pix deve ter, para pagamento; email pode deixar vazio se quiser; país pode ser opcional).
Após salvar, o usuário agora tem o perfil completo. Esse formulário provavelmente corresponde à página profile.tsx ou um componente ProfileForm dentro do index se for modal. Depois disso, o app pode navegar para a tela principal.
Dashboard Principal: A tela principal pode ser dividida em seções ou abas:
Uma aba/lista Anúncios Disponíveis: lista de anúncios que:
Estão ativos;
Pertencem a categorias que o usuário selecionou (ou poderíamos mostrar todos, mas ordenar priorizando os de interesse; mas para simplicidade, filtramos para interesses do usuário, e talvez mostrar “Outros anúncios” separados caso ele queira ver de fora do interesse).
Que o usuário ainda não viu naquele dia (checar tabela AdViews).
Que ainda possuem saldo disponível (anúncios esgotados não aparecem).
Cada item da lista mostrará: Título do anúncio, categoria, recompensa (ex.: “💰 $0.01”), e talvez um indicador de mídia (ex ícone de vídeo ou imagem).
Ao lado, um botão Ver Anúncio.
Uma aba/lista Tarefas Disponíveis: lista de tarefas ativas:
Filtrar por tipo/categoria conforme preferência do usuário, similar ao acima.
Filtrar também as que o usuário não fez ainda.
Mostrar: Título da tarefa, talvez um breve resumo (ex: “Entre no grupo X”, “Cadastre-se no site Y”), recompensa (ex: “💰 $0.50”).
Botão Iniciar Tarefa.
Alternativamente, em vez de abas, pode ser uma única lista mista ou uma homepage com cartões: ex: um card “Anúncios (N disponíveis hoje)” e um card “Tarefas (M disponíveis)”. Clicar leva às listas. Depende do design. Para MVP textual, podemos imaginar abas ou tabs são claros.
No topo da tela, além do saldo atual, pode ter um menu/perfil: clicando no avatar ou nome abre página de perfil/config (para editar dados ou preferências novamente).
Também um botão para “Sacar” que leva à tela de saque (ou um modal) caso o saldo >= mínimo. Se saldo insuficiente, botão pode estar desabilitado com dica do mínimo.
Talvez mostrar um pequeno banner do status (ex: “Você está no nível 1 – Novato. Complete mais 3 tarefas para nível 2!” para gamificação).
Visualizando um Anúncio: Quando o usuário clica "Ver Anúncio" em um item, abrimos um modal lateral ou de tela cheia apresentando o anúncio. Exemplo de fluxo:
O modal mostra o conteúdo: se for vídeo YouTube, podemos embutir um player (inline frame do YT). Se for imagem, mostrar imagem e um texto/descrição abaixo ou um botão "Saiba mais" que abriria o link do anunciante.
Um timer visível conta regressivamente de 10 segundos. Podemos sobrepor isso no canto ("10...9...8...").
Possivelmente desabilitar ações como fechar antes do tempo ou clicar fora para fechar – ou se fechar, não conta. (Podemos, por segurança, só habilitar o botão "Fechar/Concluir" após os 10s).
Ao terminar os 10 segundos, exibimos uma marca de check ou mensagem "✔ Anúncio concluído! Você ganhou $X". E então fechamos o modal automaticamente ou mostra botão para fechar.
Após fechar, removemos aquele anúncio da lista ou indicamos de alguma forma que já foi visto (ex: mudar estado do botão para ✅ Visto).
Imediatamente creditamos o valor: aqui, escolhemos se iremos creditar instantaneamente ou acumular e creditá-los todos juntos. Provavelmente podemos creditar instantâneo para que o saldo do usuário já reflita o ganho (isso dá feedback positivo imediato). No backend, assim que o tempo completou, fazemos a chamada: o frontend chama /api/ads/view com {adId}. No backend:
Verifica se esse usuário já viu esse ad hoje (só para garantia).
Se não, cria registro em AdViews, incrementa viewsCount do ad, decrementa budget ou similar, e adiciona o reward no saldo do usuário.
Retorna sucesso.
Nota: O temporizador de 10s do lado cliente não é totalmente confiável para definir transação (um usuário malicioso poderia tentar burlar?). Porém, mesmo que tente burlar, o backend faz sua validação. Podemos ter confiança razoável usando o cliente para contar tempo, já que o Telegram WebApp não permite facilmente múltiplas janelas ou manipulação (não impossível, mas ok para MVP). Se quisermos rigor, poderíamos marcar o timestamp de abertura e somente aceitar se 10s se passaram – mas isso exigiria comunicação ou validação extra. Para MVP, simples: confia no cliente para indicar finalização.
Executando uma Tarefa: Quando clica "Iniciar Tarefa":
Semelhante, abrimos um modal com detalhes. Dependendo da tarefa, a UI pode variar um pouco:
Mostrar descrição do que fazer, e possivelmente um botão/link para fazê-lo.
Exemplo: "Entre no grupo XYZ para concluir. [Botão: Abrir Grupo]" – esse botão usamos Telegram.WebApp.openTelegramLink('https://t.me/xyz') ou simplesmente um <a> que abre no navegador/Telegram (No Android, links t.me abrem diretamente Telegram app).
Podemos não detectar automaticamente se ele entrou, então instruímos: "Depois de ingressar, volte aqui e clique em Concluir".
Exemplo 2: "Cadastre-se no site. [Botão: Abrir Site]" – abre link do site talvez fora do Telegram (o Telegram WebView permite abrir um link externo).
Para cada tarefa podemos mostrar um campo de confirmação se aplicável: e.g. "Informe o e-mail que você usou no cadastro para validarmos" ou "Clique em concluir após terminar".
O usuário então faz a ação externa e retorna, clica “Concluir Tarefa” no nosso modal.
Ao clicar, chamamos /api/tasks/submit com {taskId, maybe proof text}. Backend:
Cria um registro em TaskCompletions com status "pending".
(Opcional: podemos imediatamente reduzir o slot disponível: incrementa completionsCount da task; se atingiu maxCompletions, marcar task inativa para não aparecer mais).
Retorna ok.
A interface então avisa usuário: "Tarefa enviada para verificação! Você receberá a recompensa após aprovação." E retira a tarefa da lista ou marca como pendente (podemos ter uma seção "Pendentes" para o usuário saber).
O usuário não ganha nada ainda até aprovação.
Acompanhamento e Engajamento Contínuo:
O usuário pode repetir o processo diariamente para anúncios recorrentes e conforme surgem novas tarefas.
Se implementarmos notificações, o bot poderia alertar quando há novos anúncios/tarefas. MVP skip.
O usuário em seu perfil pode ajustar preferências a qualquer momento (talvez quer ver mais categorias, etc.).
Ele pode ver histórico de ganhos (podemos ter uma página "Histórico" mostrando últimas 20 ações remuneradas).
Solicitando Saque:
Quando o usuário atinge o mínimo, ele clica "Sacar".
Aparece um modal ou página solicitando confirmação:
Mostrar saldo disponível e opções (Pix ou USDT) se tiver ambas info. Talvez ele previamente escolheu um preferido, mas damos escolha a cada saque.
Após escolher, perguntar "Tem certeza que deseja sacar X (taxas ... )?" – aqui, se fosse crypto, poderíamos avisar de eventuais taxas de rede descontadas (mas se pagaremos manual e garantimos que recebe cheio, ok).
Ao confirmar, chamamos /api/withdraw com {amount, method}. (Podemos por segurança sempre sacar tudo ou deixar ele digitar? Alguns apps deixam escolher valor. Poderíamos permitir sacar parcial, mas MVP podemos simplificar e sacar tudo de uma vez. Vamos supor que saca tudo ou pelo menos o mínimo).
Backend:
Verifica se user.balance >= amount && amount >= minimum.
Cria registro Withdrawal com status pending.
Deduz do balance do usuário colocando em pending (talvez move para pendingBalance).
Retorna sucesso.
Frontend: confirma "Saque solicitado com sucesso! Você receberá em breve." e atualiza interface (saldo disponível talvez fique zerado ou reduzido).
Admin será notificado ou verificará no dashboard.
Processo Admin (resumo): Enquanto usuários fazem isso, no lado admin:
Um admin acessa /admin e faz login via PIN (NextAuth cred).
Ele vê lá que tem X tarefas pendentes, Y saques pendentes.
Vai na página de pendências de tarefas, confere uma por uma, clica aprovar ou rejeitar:
Se aprovar, o sistema (via admin API route) marca como approved e chama função que credita reward da task no balance do usuário.
Se rejeitar, marca como rejected e possivelmente poderia devolver slot (completionsCount-- if needed) mas isso é detalhe.
Vai na página de saques pendentes, pega dados e efetua pagamento externo:
Ex: se for USDT, usa nossa carteira/metamask para enviar 3 USDT ao endereço fornecido.
Se for Pix, abre o app bancário e transfere R$20 para aquela chave.
Depois volta ao painel, clica “Mark as Paid” para aquele saque:
Chama API /api/admin/markWithdrawPaid (id), backend marca status paid, e registra timestamp.
Backend also could subtract that from user balance if not done yet (depending on how we manage double accounting).
Admin também pode gerenciar criação de novos anúncios/tarefas se há anunciantes interessados:
Por enquanto, assumimos que nós (admins) cadastramos manualmente as ofertas de anunciantes via esse painel, não havendo interface separada para o anunciante. No futuro poderíamos ter login de anunciantes e painel próprio, mas MVP não.
Admin monitora saldo total a pagar. Se quisermos, podemos ter um “financeiro” interno: ex., um registro de quanto recebemos dos anunciantes vs quanto pagamos aos usuários, para garantir sustentabilidade. Isso pode ser feito offline ou em planilha também no início.
Testes Locais (Modo indexlocal): Para facilitar desenvolvimento e testes fora do Telegram, implementamos a página indexlocal.tsx.
Essa página rodará no mesmo app, acessível talvez em desenvolvimento como http://localhost:3000/indexlocal ou no deploy como /indexlocal (poderíamos protegê-la ou não divulgar no prod).
Ela simula o comportamento do index principal sem precisar do Telegram:
Podemos ter um formulário simples no topo: “Simular usuário Telegram – insira Telegram ID ou nome”. Ao preencher e submeter, o página poderia criar uma sessão fake para esse usuário, chamando as mesmas funções de criação de usuário no backend (talvez um endpoint dev que bypassa auth). Ou mais simples: usar NextAuth credentials: ex. digitar um PIN universal para entrar como um “test user”.
Para MVP, talvez mais simples: se indexlocal detecta que não está no Telegram (sempre), ele por convenção loga com um usuário de teste predefinido (e.g., id 0, nome "Teste"). Podemos criar no banco um usuário dummy para isso. Assim toda funcionalidade pode ser testada (ver anúncios, etc.) sem autenticação real.
Essa página então mostra a mesma interface principal (pode reusar os mesmos componentes de listagem, etc.), mas sem o Telegram context. Útil para dev e QA.
Encerramento: O usuário pode fechar o app (saindo do bot) a qualquer momento. Na próxima vez que retornar, todos os dados persistem (perfil, saldo, etc.). A autenticação via Telegram ocorrerá de novo, mas retornará o mesmo usuário. Poderíamos implementar session persistente com cookies para web, mas dentro do Telegram WebApp, toda vez que abrir ele enviará os credenciais novamente, então está ok.
Detalhamento das Páginas e Componentes
Vamos enumerar as principais páginas (rotas Next.js) do projeto e seus papéis, bem como componentes importantes e como interagem. Isso servirá de guia para implementação organizada:
pages/index.tsx – Página Inicial (Telegram WebApp):
Esta é a página carregada quando o usuário abre o AdsGram via Telegram. Responsabilidades:
Detectar/obter credenciais Telegram do contexto. Podemos usar efeito useEffect no front para ler window.Telegram.WebApp.initDataUnsafe ou chamar Telegram.WebApp.ready(). Enviar esses dados para /api/auth/telegram via fetch para logar/criar usuário.
Enquanto a autenticação ocorre, exibir um loading ou algo (Telegram por padrão mostra um splash até WebApp.ready() ser chamado).
Após login bem-sucedido (podemos receber o user profile de volta), verificar se o perfil está completo. Se não, redirecionar para /profile ou exibir componente de preenchimento de perfil.
Se perfil ok, renderizar o Dashboard: pode consistir de um componente <Dashboard> que contém a lógica/estado para listar anúncios e tarefas.
O Dashboard poderia internamente fetch /api/ads e /api/tasks para pegar as listas filtradas para aquele usuário. Ou talvez nosso API retorne já filtrado com base nas preferências (o backend pode receber userId e fazer a query).
Exibir listas (podemos usar acordeão, abas ou simplesmente títulos "Anúncios" e "Tarefas" com cada lista).
Cada item de anúncio pode ser a seu próprio componente <AdCard> com info e botão.
Cada item de tarefa um <TaskCard>.
Ao clicar nos botões, podemos usar um estado no Dashboard like setActiveAd(ad) ou setActiveTask(task) que fará renderizar o modal.
O Modal em React pode ser um componente <AdModal> e <TaskModal> ou um genérico que dependendo do conteúdo ativo mostra uma ou outra. Estes modais serão posicionados absolutos (fixed) e estilizados talvez como um painel sobreposto semi-transparente ou tela cheia.
O AdModal vai iniciar o timer e mostrar conteúdo. Podemos integrate com framer-motion para fade in/out.
O TaskModal mostrará instruções e um botão de concluir ou inputs.
Também renderizar header e menu: talvez <Header> componente com logo/nome do app, e um canto com o avatar e nome do usuário que ao clicar vai para perfil ou dropdown.
Mostrar saldo atual e botão de saque: ex: Header pode ter Saldo: 2.50 USDT e um ícone de carteira clicável para saque.
Importante: No contexto Telegram, index.tsx deve chamar Telegram.WebApp.ready() quando nossa UI está pronta, para Telegram parar o splash loading. Também podemos setar algumas Telegram WebApp properties: ex Telegram.WebApp.setHeaderColor('bg_color') etc., e Telegram.WebApp.MainButton if we use (maybe not needed here).
pages/indexlocal.tsx – Página Inicial Local (Teste):
Tem funcionalidade similar ao index, mas inclui lógica para permitir uso fora do Telegram.
Talvez envolver o mesmo <Dashboard> componente, mas precedido por um check de auth. Podemos reutilizar NextAuth here: possivelmente, indexlocal poderia estar protegida por a mesma sessão (ex: if not logged in, show login form). Ou usamos NextAuth to allow login with a test credential.
Simpler: indexlocal might simply bypass auth and simulate a specific user. E.g., call an API /api/auth/test that logs in as a test user (maybe using NextAuth session cookie).
Or embed a small form: "Digite seu Telegram ID para simular login" -> on submit, call backend to create/get that user and store session.
After that, show <Dashboard> identical to main.
This page is mostly for developers, so not exposed to end users.
pages/profile.tsx – Página de Perfil/Onboarding:
Essa página (ou poderia ser um componente modal dentro index) coleta e exibe os dados do perfil do usuário.
Formulário com campos: nickname (readonly or editable?), email, wallet, pix, location, categories (multi-select), task types (multi-select).
Pode reusar some UI components for multi-select (like checkboxes).
Botão Salvar que faz POST /api/profile para atualizar o usuário.
Após salvar, pode navegar para "/" (dashboard).
Se for usado como onboarding obrigatório, index.tsx pode redirect here until done. Mas se preferir modal, poderíamos integrar sem separate route. A route approach is straightforward though.
Também a página Perfil serve para edição futura: usuário abre para alterar algo.
Componentes UI:
AdCard: Componente para exibir um anúncio na lista. Mostra título, categoria, recompensa, e um botão "Ver". Poderia mostrar também quantos segundos (10s) ou um ícone de play se é vídeo.
TaskCard: Componente para exibir uma tarefa na lista. Mostra título, talvez um resumo de ação ("Entrar em grupo", "Cadastrar..."), recompensa, botão "Iniciar".
AdModal: Componente para o modal de anúncio. Props: ad data. Internamente:
Mostra mídia (um sub-componente, ex: if video -> <iframe> or a video player component; if image -> <img>).
Mostra um contador. Podemos implementá-lo com React state useEffect (count down from ad.duration to 0 at 1s intervals).
Bloqueia fechar até chegar a 0.
Ao 0, chama callback prop onComplete() que notifica o parent (Dashboard) para creditar e fechar modal.
Mostra uma mensagem de concluído e um botão "Fechar" se não fechar auto.
TaskModal: Componente para modal de tarefa. Props: task data.
Mostra descrição/instruções (formatar talvez com line breaks).
Se task.link existe, exibir um botão "Abrir [nome]" – onclick: window.open(task.link, '_blank') ou if it's tg:// link, can use Telegram JS openTelegramLink.
Se task.code existe (referral code), mostrar "Use o código: XYZ".
Possível campo de texto para prova se necessário (task.type == signup maybe ask "Informe o email usado").
Botão "Concluir" – habilitado talvez só depois de clicar no link? Difícil saber se fez mesmo, então deixa clicável de cara e o usuário decide clicar só quando tiver terminado.
onConclude: coleta info (if any) e chama /api/tasks/submit.
Fecha modal e notifica usuário pendente.
Header: Top bar with logo/title, maybe toggle between Ads and Tasks (if not using separate pages), shows balance and a link/icon to profile and to withdraw.
Footer (if needed): maybe not needed in a mobile context, but possibly a nav bar at bottom if we want (like tabs for Home, History, Profile).
LoginAdminForm: A simple form for admin login (PIN input) to be shown if not authenticated on admin pages.
Admin Pages/Components:
pages/admin/index.tsx: After login, this could show a Dashboard with summary metrics (cards like: total users, tasks pending count, etc.) and navigation links to specific sections (Users, Ads, Tasks, Withdrawals).
pages/admin/users.tsx: List all users. Possibly allow clicking one to see details (or inline expand row).
pages/admin/ads.tsx: List ads with their info (views, budget left, active/inactive toggle). Also a form to create new Ad. We might also allow editing existing (but MVP can recreate if needed).
pages/admin/tasks.tsx: Similar listing of tasks. Form to create new Task.
pages/admin/pending-tasks.tsx (or combine tasks page): Show list of task submissions pending. Each entry with user, task, maybe a link to user and task details, and buttons Approve/Deny. This could also be done inline in tasks page or separate.
pages/admin/withdrawals.tsx: List pending withdrawals. Each entry with user, amount, method, details. Maybe a button "Mark Paid" or "Cancel".
We can simplify by making one page with tabs for pending tasks & withdrawals under "Approvals".
Admin Components: We can reuse normal components for lists (like maybe use a table) or use something like Headless UI's Table if exists. Tailwind styling for tables or list items.
Possibly a Modal component if admin has pop-ups for details; or navigate to subpages like /admin/user/[id] for user details, etc.
Estado e Gerenciamento:
We will likely use React hooks for local state. Global state might not be necessary if we rely on server (fetch data as needed). But for things like user profile (to display name/avatar in header across pages) we can fetch once on login and use context or NextAuth session (NextAuth provides useSession hook with user object globally). Actually, integrating NextAuth for normal user sessions might simplify state: we could store the Telegram-authenticated user in NextAuth session as well (though NextAuth is primarily used for admin PIN here, but we could have it manage both user and admin sessions separately with different providers). Alternatively, manage user session ourselves via cookies.
For MVP, a straightforward way: use NextAuth with two providers:
TelegramProvider (custom) or Credentials that verifies Telegram data, for user.
AdminCredentials for admin PIN.
NextAuth supports multiple providers. But having both user and admin might conflict in same session? Possibly mark admin as admin in session.
It might be simpler to not use NextAuth for user at all, and just handle user session via a cookie JWT. But using NextAuth's JWT feature could unify.
However, given time, maybe we do:
NextAuth with credentials: if credentials include a field isAdmin, route accordingly. But Telegram login is not via form.
Perhaps easiest: Not use NextAuth for Telegram users (just custom approach), and only use NextAuth for admin on /admin.
Yes, do that to avoid confusion. So:
Normal user login: handled by our API (the /api/auth/telegram route we make).
Admin login: NextAuth credentials with PIN.
Segurança Adicional:
Ensure that API routes check authorization:
e.g., /api/ads/view must ensure the request is coming from an authenticated user (we can use a session cookie or require a token passed from front – since inside Telegram webview, CSRF might not be big risk, but better to have some auth). If we used NextAuth for user, we'd have their session cookie to trust. If custom JWT, ensure to verify it.
/api/tasks/submit similarly.
/api/admin/* routes must only allow if admin session.
Rate limit certain actions maybe (like multiple PIN attempts which we handle by delay UI side anyway, or prevent spam hitting view endpoints).
Telegram WebApp context itself provides some level of gating (only launched through the bot likely).
Simulação e Dados Mock:
Como não teremos integração real com redes blockchain ou Pix no MVP, todas recompensas e pagamentos serão simulados. Ou seja, o valor USDT não será realmente transferido on-chain durante o MVP, mas guardado como registro interno. Quando um admin marca um saque como pago, assume-se que foi pago fora do sistema. Em produção, poderíamos integrar APIs de pagamento (por ex, usar API de exchange ou Fireblocks para USDT, ou API bancária para Pix) – isso é avanço futuro.
Da mesma forma, verificações automáticas de tarefas (ex: checar se usuário entrou mesmo no grupo Telegram via bot API) não serão implementadas agora. Vamos depender do admin para validar manualmente. Em versões futuras, poderíamos usar a Telegram Bot API para verificar getChatMember no grupo, etc., mas exige que o bot seja admin no grupo – possível, mas deixamos de lado neste MVP.
Portanto, qualquer “confirmação” no MVP é superficial. O foco é construir o fluxo de ponta a ponta, mesmo que algumas partes sejam mock/manual.
Considerações Finais e Próximos Passos
Com este planejamento detalhado, podemos partir para a implementação seguindo as etapas definidas. Cada componente e página deve ser desenvolvida conforme descrito, sempre cuidando de:
Documentar no código: adicionar comentários explicando a funcionalidade de funções, componentes e trechos complexos, para manter a clareza (lembrando que o Codex tende a se sair melhor com orientações claras).
Manter o arquivo de andamento (andamento.md): A cada funcionalidade implementada, será registrado nesse arquivo o que foi feito, como foi testado, e qualquer pendência ou decisão tomada. Isso cria um log útil de progresso.
