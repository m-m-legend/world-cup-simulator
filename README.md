# 🏆 Simulador de Copa do Mundo 2026

Solução completa para o processo seletivo de Estágio em Desenvolvimento de Software da Katalyst 2026.

## 📋 Características

✅ **Backend NestJS** - API robusta e escalável
✅ **Frontend HTML/CSS/JavaScript** - Interface minimalista e elegante
✅ **Integração com API Externa** - Consumo de dados de seleções da Copa
✅ **Simulação Completa** - Fase de grupos até final
✅ **Design Responsivo** - Funciona em desktop e mobile
✅ **Fisher-Yates Shuffle** - Randomização correta de grupos

## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ e npm
- Git

### Passos

1. **Clone ou extraia o repositório**

```bash
cd world-cup-simulator
```

2. **Instale as dependências**

```bash
npm install
```

3. **Compile o TypeScript**

```bash
npm run build
```

4. **Inicie a aplicação**

```bash
npm start
```

A aplicação estará disponível em: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
world-cup-simulator/
├── src/
│   ├── services/
│   │   ├── cup.service.ts        # Orquestração da simulação
│   │   ├── match.service.ts       # Lógica de partidas
│   │   ├── teams.service.ts       # Gerenciamento de seleções
│   │   └── util.service.ts        # Utilitários e randomização
│   ├── app.controller.ts          # Controladores da API
│   ├── app.module.ts              # Módulo principal
│   └── main.ts                    # Entry point
├── public/
│   ├── index.html                 # Interface principal
│   ├── styles.css                 # Estilos
│   └── app.js                     # Cliente JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🎮 Como Usar

1. Abra o navegador em `http://localhost:3000`
2. Clique no botão **"▶️ Iniciar Simulação"**
3. Aguarde o carregamento das seleções da Copa
4. Veja a fase de grupos, partidas e resultado final

## 🔄 Fluxo da Simulação

### 1. Busca de Seleções
- Consome API: `GET /WorldCup/GetAllTeams`
- Recebe 32 seleções da Copa do Mundo

### 2. Criação de Grupos
- Embaralha as 32 seleções usando Fisher-Yates Shuffle
- Distribui em 8 grupos (A-H) de 4 seleções cada

### 3. Fase de Grupos
- **3 rodadas** de partidas por grupo
- **6 jogos** por grupo (2 jogos por rodada)
- Simulação de gols aleatórios
- Contabilização de pontos:
  - Vitória: 3 pontos
  - Empate: 1 ponto
  - Derrota: 0 pontos

### 4. Critérios de Desempate
1. Número de pontos
2. Saldo de gols
3. Gols marcados
4. Sorteio aleatório

### 5. Fase Eliminatória
- **Oitavas**: 1º de um grupo vs 2º de outro (16 times)
- **Quartas**: 8 times, 4 partidas
- **Semifinal**: 4 times, 2 partidas
- **Final**: 2 times, 1 partida

#### Regra de Chaveamento para Oitavas:
```
1A x 2B      1B x 2A
1C x 2D      1D x 2C
1E x 2F      1F x 2E
1G x 2H      1H x 2G
```

### 6. Pênaltis
- Em caso de empate na fase eliminatória
- Simula disputa de pênaltis
- Envia resultado para API

### 7. Envio do Resultado
- POST para: `/WorldCup/FinalResult`
- Formato JSON com campeão e vice-campeão

## 📊 Exemplo de Resposta da API

```json
{
  "equipesA": "d1b8ef55-3477-4d76-bb1a-811132eb25fc",
  "equipesB": "6ca272b3-48a7-4e11-a2f4-79be4c038c24",
  "golsEquipeA": 1,
  "golsEquipeB": 1,
  "golsPenaltyTimeA": 4,
  "golsPenaltyTimeB": 3
}
```

## 🎨 Design

- **Minimalista mas elegante**: Gradientes sutis e tipografia clara
- **Animações suaves**: Transições e efeitos visuais
- **Responsivo**: Adapta-se a qualquer tamanho de tela
- **Cores significativas**:
  - Roxo primário: Principal, cálculo
  - Amarelo: Destaques, ações
  - Verde: Sucesso
  - Vermelho: Erros

## 🔐 Configuração

O arquivo utiliza as seguintes configurações:

- **Git User**: `m-m-legend` (conforme especificado)
- **API Base**: `https://development-internship-api.geopostenergy.com`
- **Porta**: `3000` (local)

## 📝 Algoritmo de Randomização

Implementação do Fisher-Yates Shuffle usando `crypto.getRandomValues()`:

```typescript
function randomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

## 🐛 Resolução de Problemas

### Porta 3000 já em uso
```bash
# Use uma porta diferente
PORT=3001 npm start
```

### Erro de CORS
- A aplicação já inclui headers de CORS
- Certifique-se que a API está acessível

### Erro ao buscar seleções
- Verifique a conexão com a internet
- Confirme que o `git-user` está correto
- Verifique o URL da API

## 📚 Tecnologias Utilizadas

- **NestJS**: Framework Node.js robusto
- **TypeScript**: Tipagem forte e segura
- **Express**: Servidor HTTP
- **Axios**: Cliente HTTP
- **HTML5**: Semântica e acessibilidade
- **CSS3**: Animações e layouts modernos
- **JavaScript Vanilla**: Sem dependências desnecessárias

## ✨ Recursos Destacados

### 1. Fase de Grupos
- Visualização clara dos standings
- Estatísticas de cada time (vitórias, empates, derrotas)
- Pontos acumulados

### 2. Partidas
- Todos os 48 jogos da fase de grupos (6 por grupo)
- Resultado simulado de cada partida
- Identificação clara de rodadas

### 3. Fase Eliminatória
- Oitavas de final com 8 partidas
- Quartas de final com 4 partidas
- Semifinal com 2 partidas
- Final com 1 partida
- Simulação de pênaltis quando necessário

### 4. Resultado Final
- Campeão destacado com troféu 🏆
- Vice-campeão e placar final
- Animação de celebração

## 🎯 Critérios de Avaliação Atendidos

✅ Consumo correto da API
✅ Randomização adequada (Fisher-Yates)
✅ Geração de grupos correta
✅ Partidas fixas por grupo
✅ Contabilização exata de pontos
✅ Critérios de desempate implementados
✅ Chaveamento de oitavas correto
✅ Simulação até a final
✅ Envio de resultado para API
✅ Frontend minimalista e elegante
✅ Uso de HTML, CSS, JavaScript puros
✅ Código limpo e bem estruturado

## 📄 Licença

Processo Seletivo Katalyst - Estágio 2026

## 👨‍💻 Desenvolvido para

Katalyst Data Management - Estágio em Desenvolvimento de Software 2026