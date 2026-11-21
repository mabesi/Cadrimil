# Lições Aprendidas — Cadrimil

> Documento de extração de conhecimento para consolidação multi-projeto.
> Não é um template nem uma implementação: é insumo para identificar o que se repete,
> o que se adapta e o que é específico de cada aplicativo.

## Metadados

| Campo | Valor |
|---|---|
| Projeto | Cadrimil |
| Domínio | Cálculo de diárias militares e consulta de tabelas/legislação |
| Stack principal | Expo SDK 58, React Native 0.88, React 19, TypeScript 6, React Navigation 7 |
| Persistência | AsyncStorage local |
| Fonte de dados | JSON remoto (`api.json`) + configuração local (`app.config.ts` + `adConfig.js`) |
| Monetização | Link de doação externo + anúncio premiado (AdMob) |
| Distribuição | EAS Build (development, preview, production) |
| Período analisado | Nov/2025 a Nov/2026 |
| Fontes | Código-fonte, histórico Git, sessões do Antigravity, README, `package.json`, políticas e builds |
| Status | Documento vivo; revisar a cada projeto concluído |

## Como ler este documento

Cada lição recebe uma classificação:

| Tag | Significado |
|---|---|
| `BASE` | Deve fazer parte da estrutura básica de qualquer app |
| `ADAPT` | Padrão reutilizável, mas com variações por projeto |
| `SPEC` | Específico do Cadrimil ou do domínio militar |
| `ANTI` | Erro/armadilha a evitar |
| `DEBT` | Dívida técnica conhecida, aceita ou pendente |

## Índice de lições

| ID | Lição | Tag | Status |
|---|---|---|---|
| L-001 | Externalizar dados e configurações em JSON | `BASE` | Adotado |
| L-002 | Validar o contrato da API em runtime | `BASE` | Adotado |
| L-003 | Separar dados remotos de estado da missão | `BASE` | Adotado |
| L-004 | Persistir entidades localmente com repository | `BASE` | Parcial |
| L-005 | Intercambiar dados por arquivo + deep link | `ADAPT` | Adotado |
| L-006 | Gerar PDF a partir de HTML | `ADAPT` | Adotado |
| L-007 | Doação externa + anúncio premiado opcional | `ADAPT` | Adotado |
| L-008 | Design tokens e componentes reutilizáveis | `BASE` | Adotado |
| L-009 | Navegação tipada e deep links | `BASE` | Parcial |
| L-010 | Perfis de build e versionamento | `BASE` | Adotado |
| L-011 | Privacidade, consentimento e licença | `BASE` | Parcial |
| L-012 | Nomenclatura consistente e verificável | `BASE` | Corrigido |
| L-013 | Evitar código morto e lógica duplicada | `BASE` | Corrigido |
| L-014 | Verificação automatizada antes de entregar | `BASE` | Pendente |
| L-015 | Documentação verificada contra o código | `BASE` | Adotado |
| L-016 | Dependências, lockfile e auditoria | `BASE` | Adotado |
| L-017 | Configuração local obrigatória e não versionada | `BASE` | Adotado |
| L-018 | Funcionamento offline e cache | `ADAPT` | Adotado |
| L-019 | Estados de erro, carregamento e vazio | `BASE` | Parcial |
| L-020 | Segurança de importação, exportação e HTML | `BASE` | Parcial |
| L-021 | Versionamento de schema e migração de dados | `BASE` | Parcial |
| L-022 | Acessibilidade e testIDs | `BASE` | Pendente |
| L-023 | Safe area, teclado e layout por plataforma | `BASE` | Parcial |
| L-024 | Observabilidade e relatórios de erro | `ADAPT` | Pendente |
| L-025 | Lições de uso de agentes de IA | `BASE` | Adotado |

---

## 1. Resumo executivo

### O que funcionou bem

- **Aplicativo data-driven**: tabelas, grupos, localidades, AED e decretos vêm de um JSON remoto. O app não precisa de nova versão para atualizar valores.
- **Separação de responsabilidades**: `DataContext` cuida dos dados remotos; `MissionContext` cuida do estado da missão; `services` cuidam de I/O; `utils` guardam regras puras.
- **Componentes reutilizáveis**: `CustomButton`, `CustomInput`, `CustomSelect`, `CustomCheckbox`, `PeriodCard` e `MissionCard` reduzem duplicação visual.
- **Design tokens**: cores, tipografia, espaçamentos e raios centralizados em `src/constants`.
- **Intercâmbio de dados**: exportação `.cmil`, importação JSON, deep link e compartilhamento nativo.
- **PDF via HTML**: `expo-print` + `expo-sharing` com template visual consistente.
- **Monetização discreta**: doação por link externo e anúncio premiado opt-in, sem bloquear o uso.
- **Build reprodutível**: `app.config.ts`, `eas.json` com perfis e versões explícitas.
- **Correções com evidência**: logs de build, `expo-doctor`, `expo install --check`, `npm audit` e `tsc` foram usados para validar mudanças.

### O que precisa amadurecer

- **Sem testes automatizados, lint ou CI**: a validação dependia de `tsc`, `expo-doctor` e teste manual.
- **Atualização offline ainda básica**: há fallback e cache, mas falta sincronização em background e teste automatizado do fluxo.
- **Versionamento de schema incompleto**: o JSON remoto já tem `schemaVersion`; as missões salvas ainda não têm versão nem migração.
- **Strings em português hardcoded**: não há i18n.
- **Sem observabilidade**: não há crash reporting, analytics ou logs estruturados.
- **Dívidas de tipagem**: `any`, `as never`, `@ts-ignore` e uso de `expo-file-system/legacy`.
- **Privacidade incompleta**: política desatualizada e sem fluxo de consentimento de anúncios (UMP).

---

## 2. Estratégias que funcionaram

| Estratégia | Como apareceu no Cadrimil | Tag | Por que reutilizar |
|---|---|---|---|
| Dados externos em JSON | `https://apps.mabesi.dev/cadrimil/api.json` alimenta tabelas, grupos, localidades, AED e decretos | `BASE` | Atualização de conteúdo sem publicar novo app |
| Fallback offline em 3 camadas | API → cache local → JSON embutido, com banner de origem e data | `BASE` | Garante cálculo na primeira execução offline |
| Validação de contrato | `isCadrimilData` valida o JSON antes de entrar no estado | `BASE` | Evita crash e dados inválidos na UI |
| Contextos separados | `DataContext` (remoto) e `MissionContext` (local/UI) | `BASE` | Reduz acoplamento e facilita testes |
| Cálculos puros | `getValorDiaria`, `calcularDiarias`, `calculateTotal` | `BASE` | Regras testáveis, sem dependência de React |
| Componentes genéricos | Botões, inputs, selects, checkbox, cards | `BASE` | Consistência visual e menos código repetido |
| Design tokens | `Colors`, `Typography`, `Spacing`, `BorderRadius` | `BASE` | Tema centralizado e mudanças globais seguras |
| Arquivo de intercâmbio | `.cmil` com JSON interno + `Sharing` | `ADAPT` | Backup, compartilhamento e integração entre usuários |
| Deep link de arquivo | Intent filter para `file://` e `content://` com `.*\.cmil` | `ADAPT` | Abrir missão direto do WhatsApp/gerenciador de arquivos |
| PDF por HTML | Template HTML + `Print.printToFileAsync` + `Sharing` | `ADAPT` | Layout rico sem biblioteca pesada de PDF |
| Monetização opt-in | Doação por link + rewarded ad | `ADAPT` | Receita sem bloquear funcionalidade principal |
| Config local ignorada | `adConfig.js` fora do Git, IDs via `app.config.ts` | `BASE` | Evita vazar credenciais de anúncio |
| Perfis EAS | `development`, `preview`, `production` | `BASE` | Builds previsíveis e separação de ambiente |
| Auditoria de dependências | `expo install --check`, `expo-doctor`, `npm audit` | `BASE` | Evita incompatibilidade e vulnerabilidades |
| Commits pequenos | Dependências, renomeação, limpeza, licença e docs em commits separados | `BASE` | Histórico legível e reversão segura |
| Documento de lições | Este arquivo | `BASE` | Conhecimento transferível entre projetos |

---

## 3. Erros cometidos e como evitá-los

### 3.1 Nomenclatura e consistência

- **`Cadrmil` em vez de `Cadrimil`**: o erro se espalhou por 56 ocorrências em 10 arquivos (`CadrmilData`, `cadrmilData`, `loadCadrmilData`).
  - **Impacto**: inconsistência em tipos, funções, variáveis e documentação.
  - **Prevenção**: definir o nome oficial no início; usar busca global (`rg -i`) antes de commitar; adicionar verificação de ortografia/nomes no CI; manter um glossário em `docs/domain.md`.
  - **Tag**: `ANTI`.

- **Arquivo duplicado `icon (cópia).png` versionado**.
  - **Impacto**: ruído no repositório e dúvida sobre qual asset é o oficial.
  - **Prevenção**: convenção de nomes para assets, revisão de diffs binários e `.gitignore` para cópias temporárias.
  - **Tag**: `ANTI`.

- **Ícone adaptativo não atualizado junto com ícone/splash**.
  - **Impacto**: identidade visual inconsistente no Android.
  - **Prevenção**: checklist de assets (`icon`, `adaptive-icon`, `splash`, `favicon`) em todo redesign.
  - **Tag**: `ANTI`.

### 3.2 Dados, contratos e persistência

- **Confiar no JSON da API apenas por type assertion**.
  - **Impacto**: dados inválidos entram no estado e quebram a UI.
  - **Prevenção**: validar em runtime na fronteira (`isCadrimilData`), com mensagem de erro específica fora do `catch` de rede.
  - **Tag**: `BASE`.

- **Ausência de cache/offline**.
  - **Impacto**: sem internet, o app não calcula.
  - **Prevenção**: persistir o último payload válido, exibir dados em cache e indicar “dados podem estar desatualizados”.
  - **Tag**: `ADAPT`.

- **`schemaVersion` ausente nas missões salvas** (o JSON remoto já possui).
  - **Impacto**: mudanças futuras de formato quebram dados antigos.
  - **Prevenção**: incluir `schemaVersion`, `updatedAt` e migrações explícitas também no storage local.
  - **Tag**: `BASE`.

- **Importação valida apenas `periodos` como array**.
  - **Impacto**: arquivo malformado ou malicioso pode causar erro em tempo de execução.
  - **Prevenção**: validar o envelope completo, limites de tamanho, tipos e campos obrigatórios.
  - **Tag**: `BASE`.

- **`saveMission` redefine `dataCriacao` ao editar**.
  - **Impacto**: a data original da missão é perdida.
  - **Prevenção**: preservar `dataCriacao` ao atualizar e usar `updatedAt` separado.
  - **Tag**: `ANTI`.

- **`DateHelpers.toISOString` retorna `yyyy-MM-dd`, não ISO completo**.
  - **Impacto**: nome enganoso e risco de bugs de fuso.
  - **Prevenção**: renomear para `toDateString` ou documentar; testar fusos/DST.
  - **Tag**: `ANTI`.

- **Regra do AED ambígua**.
  - **Impacto**: o AED é multiplicado pelo total de militares de todos os períodos; se o mesmo militar aparecer em vários trechos, pode contar mais de uma vez.
  - **Prevenção**: documentar a regra de negócio e cobrir com testes.
  - **Tag**: `SPEC`.

- **Cálculo de diárias sem testes de borda**.
  - **Impacto**: mesmo dia, último dia 0,5/1,0, ano bissexto e fuso podem gerar valores errados.
  - **Prevenção**: testes unitários com tabela de casos.
  - **Tag**: `BASE`.

### 3.3 Build, dependências e ambiente

- **Lockfile travado em versão vulnerável de `react-native-google-mobile-ads`**.
  - **Impacto**: o EAS continuava usando `16.0.0`, que falhava na compilação Kotlin com RN 0.88.
  - **Prevenção**: verificar `package-lock.json`, não só `package.json`; testar build nativo cedo.
  - **Tag**: `ANTI`.

- **`npm audit fix --force` sugerindo downgrade do Expo para 52**.
  - **Impacto**: quebraria o projeto.
  - **Prevenção**: nunca aplicar `--force` sem analisar; preferir atualização de dependência pai ou `overrides` pontuais.
  - **Tag**: `ANTI`.

- **`minimatch` transitivo sem correção upstream**.
  - **Impacto**: vulnerabilidade moderada persistente.
  - **Prevenção**: `overrides` no `package.json`, teste da ferramenta afetada (`@expo/fingerprint`) e remoção do override quando o upstream corrigir.
  - **Tag**: `ADAPT`.

- **`adConfig.js` obrigatório, mas ignorado pelo Git**.
  - **Impacto**: clone novo não consegue carregar `app.config.ts`.
  - **Prevenção**: documentar o arquivo, fornecer `adConfig.example.js`, validar a presença no config e falhar com mensagem clara.
  - **Tag**: `BASE`.

- **`.gitignore` e `.easignore` com regras diferentes**.
  - **Impacto**: `adConfig.js` não vai para o Git, mas vai para o build EAS; isso pode ser intencional, mas precisa estar documentado.
  - **Prevenção**: revisar os dois arquivos juntos e documentar o que é local, o que vai para o build e o que é segredo.
  - **Tag**: `BASE`.

- **Pasta `android/` gerada localmente e ignorada**.
  - **Impacto**: drift entre máquinas e builds; mudanças nativas não versionadas.
  - **Prevenção**: usar CNG/prebuild de forma consciente; se precisar de código nativo, versionar ou usar config plugin.
  - **Tag**: `BASE`.

- **IDs de anúncio test/real alternados manualmente**.
  - **Impacto**: risco de publicar ID de teste ou usar ID real em desenvolvimento.
  - **Prevenção**: separar por ambiente (`__DEV__`, `app.config.ts`, EAS secrets) e validar no build.
  - **Tag**: `ANTI`.

- **Versão do app duplicada em `package.json`, `app.config.ts` e README**.
  - **Impacto**: divergência de versão.
  - **Prevenção**: fonte única (ex.: `app.config.ts` lê `package.json`) e script de verificação.
  - **Tag**: `BASE`.

### 3.4 UX, plataforma e layout

- **README instruía usar Expo Go**, mas o app usa módulos nativos (AdMob, picker).
  - **Impacto**: onboarding falha.
  - **Prevenção**: validar instruções contra as dependências reais; documentar development build.
  - **Tag**: `ANTI`.

- **README dizia Node 16+, mas o Expo SDK 58 exige Node 22.13+/24 LTS**.
  - **Impacto**: instalação falha em ambiente antigo.
  - **Prevenção**: derivar pré-requisitos dos `engines` e revisar a cada upgrade de SDK.
  - **Tag**: `ANTI`.

- **README afirmava suporte a tema escuro**, mas o app é light-only.
  - **Impacto**: expectativa incorreta.
  - **Prevenção**: revisar afirmações de produto contra o código.
  - **Tag**: `ANTI`.

- **Cabeçalho com `paddingTop: 48` fixo**.
  - **Impacto**: sobreposição com notch/status bar em alguns dispositivos.
  - **Prevenção**: usar `useSafeAreaInsets` em headers e telas.
  - **Tag**: `BASE`.

- **`LayoutAnimation` no Android sem habilitar `UIManager.setLayoutAnimationEnabledExperimental`**.
  - **Impacto**: animação pode não funcionar.
  - **Prevenção**: habilitar no Android ou usar `Animated`/Reanimated.
  - **Tag**: `ANTI`.

- **Ícones por emoji**.
  - **Impacto**: aparência varia por plataforma e faltam `accessibilityLabel`.
  - **Prevenção**: usar biblioteca de ícones e rótulos de acessibilidade.
  - **Tag**: `BASE`.

- **Alertas para todos os erros**.
  - **Impacto**: UX inconsistente e difícil de testar.
  - **Prevenção**: separar erros de validação, rede e domínio; usar inline errors/toasts e error boundary.
  - **Tag**: `BASE`.

### 3.5 Qualidade, segurança e operação

- **Sem ESLint, Prettier, testes ou CI**.
  - **Impacto**: erros só aparecem em runtime ou em revisão manual.
  - **Prevenção**: pipeline mínima (`typecheck`, `lint`, `test`, `build`) e branch protection.
  - **Tag**: `BASE`.

- **Uso de `any`, `as never` e `@ts-ignore`**.
  - **Impacto**: perda de segurança de tipos em navegação, imports e file system.
  - **Prevenção**: tipos de navegação, `unknown` + validação, e eliminação gradual de supressões.
  - **Tag**: `ANTI`.

- **PDF interpola nome da missão e textos sem escape HTML**.
  - **Impacto**: HTML injetado pode quebrar o layout ou simular conteúdo.
  - **Prevenção**: função `escapeHtml` para todo texto dinâmico.
  - **Tag**: `BASE`.

- **Deep link aceita qualquer `content://` ou `file://`**.
  - **Impacto**: tenta interpretar arquivos arbitrários como missão.
  - **Prevenção**: validar extensão, MIME, tamanho e schema antes de importar.
  - **Tag**: `BASE`.

- **AsyncStorage sem criptografia**.
  - **Impacto**: dados de missão ficam legíveis no dispositivo.
  - **Prevenção**: avaliar `expo-secure-store`/banco criptografado se houver dado sensível; avisar no export.
  - **Tag**: `ADAPT`.

- **Sem crash reporting/analytics**.
  - **Impacto**: erros em produção passam despercebidos.
  - **Prevenção**: Sentry/Bugsnag + eventos de funil, respeitando privacidade e consentimento.
  - **Tag**: `ADAPT`.

- **Política de privacidade desatualizada** (data de 2024, sem detalhar rewarded ads/consentimento).
  - **Impacto**: risco de reprovação na loja e inconsistência legal.
  - **Prevenção**: revisar a política a cada mudança de dados/anúncios; mapear dados coletados.
  - **Tag**: `BASE`.

- **Sem consentimento de anúncios (UMP/EEA)**.
  - **Impacto**: risco de conformidade e de personalização indevida.
  - **Prevenção**: integrar Google UMP se houver usuários na EEA/UK; documentar escolha.
  - **Tag**: `BASE`.

- **Sem `schemaVersion`/migração para dados locais**.
  - **Impacto**: atualização futura pode invalidar missões salvas.
  - **Prevenção**: versão no storage + migrações testadas.
  - **Tag**: `BASE`.

---

## 4. Funcionalidades reutilizáveis em outros projetos

### 4.1 Dados e configurações via JSON remoto

**O que é**: um endpoint retorna um JSON com conteúdos e parâmetros que o app consome em vez de hardcodar.

**No Cadrimil**:
- `src/services/api.ts` busca `https://apps.mabesi.dev/cadrimil/api.json`.
- `src/context/DataContext.tsx` carrega uma vez no mount, com retry.
- `src/utils/validation.ts` valida o contrato.
- O JSON contém `meta`, `decretos`, `aed`, `grupos`, `localidades` e `diarias`.

**Por que reutilizar**:
- Atualização de conteúdo sem release.
- Uma fonte de verdade para tabelas, textos e referências.
- Facilita administração por pessoa não desenvolvedora.

**Como generalizar**:
```json
{
  "meta": {
    "schemaVersion": 1,
    "updatedAt": "2026-11-20T12:00:00Z",
    "validFrom": "2024-12-19",
    "source": "Norma/Decreto de referência"
  },
  "content": { "...": "..." },
  "features": { "donationEnabled": true, "rewardedAdsEnabled": true }
}
```
- Definir um `RemoteDataProvider` genérico.
- Validar com schema (Zod/Valibot ou type guard).
- Ter fallback local (`assets/fallback.json`) e cache do último payload válido.
- Incluir `schemaVersion` e migração.
- Não colocar segredos no JSON remoto (IDs de anúncio, chaves, tokens).

**Cuidados**:
- Tratar offline, timeout, HTTP 4xx/5xx e JSON inválido.
- Exibir estado de erro com opção de tentar novamente.
- Não bloquear a UI inteira sem necessidade.

**Tag**: `BASE`.

### 4.2 Validação de contrato em runtime

**O que é**: validar o formato dos dados antes de usá-los.

**No Cadrimil**:
- `isCadrimilData` verifica objetos, arrays, strings não vazias, números finitos/não negativos e coerência entre `diarias`, `grupos` e `localidades`.
- A validação fica fora do `catch` de rede para não mascarar erro de contrato como erro de conexão.

**Como generalizar**:
- Usar Zod/Valibot para schemas declarativos e mensagens melhores.
- Testar com payload real + casos inválidos.
- Validar também importação de arquivos e dados do storage.

**Tag**: `BASE`.

### 4.3 Persistência local de entidades

**O que é**: salvar missões no dispositivo com CRUD.

**No Cadrimil**:
- `src/services/storage.ts` usa AsyncStorage com a chave `cadrimil_missions`.
- Datas são serializadas como `yyyy-MM-dd` e convertidas de volta ao carregar.
- `MissionContext` orquestra salvar, editar, excluir e recarregar.

**Como generalizar**:
- Criar uma interface `Repository<T>` (`list`, `get`, `save`, `remove`, `clear`).
- Namespacear chaves por app/entidade.
- Incluir `schemaVersion` e migrações.
- Tratar JSON corrompido sem apagar dados silenciosamente.
- Para dados sensíveis, avaliar SecureStore/banco criptografado.

**Cuidados**:
- Evitar gravações concorrentes (fila/serialização).
- Preservar `createdAt` e atualizar `updatedAt`.
- Testar round-trip de datas e caracteres especiais.

**Tag**: `BASE`.

### 4.4 Intercâmbio de arquivos e deep links

**O que é**: exportar/importar uma entidade como arquivo e abrir o arquivo diretamente no app.

**No Cadrimil**:
- Exportação `.cmil` com JSON interno via `FileSystem` + `Sharing`.
- Importação por `DocumentPicker` (`application/json`) e por deep link (`file://`/`content://`).
- Intent filter Android para `.*\.cmil`.
- `App.tsx` lê o arquivo, faz `JSON.parse` e carrega no `MissionContext`.

**Como generalizar**:
- Criar um envelope:
```json
{
  "format": "cadrimil.mission",
  "schemaVersion": 1,
  "exportedAt": "2026-11-20T12:00:00Z",
  "appVersion": "1.0.2",
  "data": { "...": "..." }
}
```
- Validar envelope, tamanho e schema.
- Definir extensão e MIME próprios; no Android, o MIME pode não ser reconhecido, então validar extensão/conteúdo.
- Tratar `content://` copiando para cache antes de ler.
- Não confiar no nome do arquivo nem no conteúdo.

**Cuidados**:
- `DocumentPicker` com `type: 'application/json'` pode não listar `.cmil`.
- Deep link que aceita qualquer `file://`/`content://` é amplo demais.
- Exportar dados sensíveis exige aviso ao usuário.

**Tag**: `ADAPT`.

### 4.5 Geração de PDF via HTML

**O que é**: montar HTML e converter em PDF com `expo-print`, compartilhando com `expo-sharing`.

**No Cadrimil**:
- `src/utils/pdfGenerator.ts` gera HTML com cabeçalho, tabela de períodos, AED, total e referências legais.
- Nome do arquivo é sanitizado (sem acentos/caracteres especiais).
- Fallback para `Print.printAsync` se compartilhamento não estiver disponível.

**Como generalizar**:
- Separar template, dados e estilo.
- Usar os mesmos design tokens do app (gerar CSS a partir deles).
- Escapar todo texto dinâmico (`escapeHtml`).
- Incluir rodapé com versão, data e aviso legal.
- Testar o HTML gerado com snapshot.

**Cuidados**:
- Interpolação direta de nome de missão no HTML.
- Nomes de arquivo inválidos/longos.
- Diferenças de renderização entre iOS/Android.

**Tag**: `ADAPT`.

### 4.6 Doação externa + anúncio premiado

**O que é**: monetização opcional sem bloquear o uso.

**No Cadrimil**:
- Botão **DOAR** abre `https://apps.mabesi.dev/donate` via `Linking.openURL`.
- Botão **VER ANÚNCIO** usa `RewardedAd` do `react-native-google-mobile-ads`.
- Em desenvolvimento, usa `TestIds.REWARDED`; em produção, `Constants.expoConfig?.extra?.adUnitId`.
- O anúncio é pré-carregado no mount; o botão fica desabilitado até `LOADED`.
- `requestNonPersonalizedAdsOnly: true` foi escolhido.
- Ao ganhar a recompensa, exibe agradecimento.

**Como generalizar**:
- Criar um `MonetizationConfig`:
```ts
type MonetizationConfig = {
  donationUrl: string;
  rewardedAdUnitId: string;
  rewardedEnabled: boolean;
  testMode: boolean;
};
```
- Criar hook `useRewardedAd` com estados `loading`, `loaded`, `error`, `shown` e eventos `LOADED`, `ERROR`, `CLOSED`, `EARNED_REWARD`.
- Separar IDs por ambiente (dev/preview/prod) e validar no build.
- Ter fallback se o anúncio não carregar.
- Respeitar consentimento (UMP) e política de privacidade.

**Cuidados**:
- Sem listener de `ERROR`, o botão pode ficar eternamente desabilitado.
- Sem listener de `CLOSED`, o fluxo de nova tentativa fica incompleto.
- Não interromper o uso principal com anúncio.
- Não usar ID real em desenvolvimento nem ID de teste em produção.
- Doação externa precisa de página confiável e política de loja adequada.

**Tag**: `ADAPT`.

### 4.7 Design tokens e componentes reutilizáveis

**O que é**: centralizar cores, tipografia, espaçamento e componentes visuais.

**No Cadrimil**:
- `src/constants/colors.ts`, `styles.ts`.
- Componentes: `CustomButton`, `CustomInput`, `CustomSelect`, `CustomCheckbox`, `LoadingSpinner`, `PeriodCard`, `MissionCard`.
- `Header` com `LinearGradient`.

**Como generalizar**:
- Tokens semânticos (`primary`, `surface`, `danger`, `textMuted`) em vez de nomes de cor.
- Tema claro/escuro desde o início, se houver intenção.
- Componentes com variantes e estados (`disabled`, `loading`, `error`).
- `accessibilityLabel`, `accessibilityRole` e área mínima de toque.
- Documentar o catálogo de componentes.

**Cuidados**:
- Cores duplicadas no PDF e no app.
- Componentes que escondem regra de negócio.
- `CustomSelect` com overlay e texto transparente é um hack; considerar o picker nativo.

**Tag**: `BASE`.

### 4.8 Navegação, layout e safe area

**No Cadrimil**:
- Bottom tabs: Cálculo, Missões, Tabelas, Decretos.
- Stack para Ajuda.
- `NavigationContainer` com linking e deep link handler.
- `useSafeAreaInsets` no tab bar, mas não no header.

**Como generalizar**:
- Tipar `RootStackParamList` e `TabParamList`.
- Constantes de rota em vez de strings soltas.
- Mapa único de deep links.
- Safe area em todas as telas/headers.
- Testar navegação com parâmetros e deep links.

**Cuidados**:
- `as never` esconde erros de rota.
- Header com padding fixo.
- Dois handlers de deep link podem competir.

**Tag**: `BASE`.

### 4.9 Build, configuração e distribuição

**No Cadrimil**:
- `app.config.ts` lê `adConfig.js`, define nome, slug, versão, package, bundle ID, ícones, splash, intent filters e plugin do AdMob.
- `eas.json` com perfis `development` (dev client + APK), `preview` (APK) e `production`.
- `extra.eas.projectId` vincula o projeto ao EAS.
- `versionCode` e `version` explícitos.

**Como generalizar**:
- `app.config.ts` lê variáveis de ambiente por perfil.
- IDs de anúncio e chaves via EAS secrets.
- Script de release que atualiza versão em um único lugar.
- Checklist de assets e permissões.
- CI que roda `expo-doctor`, `expo install --check`, `tsc`, testes e build.
- Documentar `android/` gerado e o que é CNG.

**Cuidados**:
- Versão divergente entre arquivos.
- `adConfig.js` ausente no clone.
- `.easignore` diferente do `.gitignore`.
- Testar build nativo cedo, não só o Metro.

**Tag**: `BASE`.

### 4.10 Privacidade, consentimento e licença

**No Cadrimil**:
- `PRIVACY_POLICY.html` descreve dados locais, AdMob, exportação e contato.
- `LICENSE` MIT com copyright.
- `README` aponta para a licença.
- Dados de missão ficam locais; exportação é iniciada pelo usuário.

**Como generalizar**:
- Mapa de dados: o que coleta, onde armazena, com quem compartilha, por quanto tempo.
- Política de privacidade versionada e datada.
- Consentimento para anúncios personalizados quando exigido.
- Data Safety (Google Play) e Privacy Nutrition Label (App Store) coerentes.
- Licença definida desde o início.
- Aviso sobre dados sensíveis em exportações.

**Tag**: `BASE`.

---

## 5. Arquitetura observada

```text
API JSON
  └─ src/services/api.ts (fetch + retry + validação)
       └─ DataContext
            ├─ CalculatorScreen
            ├─ TablesScreen
            ├─ DecreesScreen
            └─ pdfGenerator

UI
  └─ MissionContext
       ├─ src/services/storage.ts (AsyncStorage)
       ├─ CalculatorScreen
       ├─ MissionsScreen
       └─ componentes

Arquivo .cmil / deep link
  └─ App.tsx ou DocumentPicker
       └─ JSON.parse + validação
            └─ MissionContext

PDF
  └─ pdfGenerator (HTML) → expo-print → expo-sharing
```

### Camadas

| Camada | Arquivos | Responsabilidade |
|---|---|---|
| Apresentação | `src/screens`, `src/components` | UI, interação, estados locais |
| Estado | `src/context` | Dados remotos, missão atual, missões salvas |
| Serviços | `src/services` | API, storage |
| Domínio/util | `src/utils` | Cálculos, datas, formatação, PDF, validação |
| Tipos | `src/types` | Contratos TypeScript |
| Config | `app.config.ts`, `eas.json` | Build e distribuição |

### O que falta para um padrão mais forte

- Camada de domínio explícita (`src/domain`) separada de UI.
- Interfaces de repositório e casos de uso.
- Error boundary global.
- Camada de i18n.
- Camada de observabilidade.
- Testes e CI.

---

## 6. Padrões de código recomendados

- **Nomes**: um único nome oficial do produto, verificado globalmente.
- **Arquivos**: um componente por arquivo; utilitários puros sem React.
- **Tipos**: `unknown` nas fronteiras; validar antes de assumir; evitar `any`.
- **Navegação**: param lists tipadas; sem `as never`.
- **Erros**: distinguir validação, rede, domínio e inesperado; não usar `Alert` para tudo.
- **Datas**: funções explícitas (`toDateString`, `fromDateString`) e testes de fuso.
- **Moeda**: `Intl.NumberFormat('pt-BR')`; não concatenar manualmente.
- **Comentários**: explicar decisão, não repetir o código.
- **Assets**: checklist e nomes estáveis.
- **Commits**: convencionais, pequenos e por assunto.
- **Docs**: atualizar no mesmo PR.

---

## 7. Qualidade, testes e feedback

### Situação atual

- `npx tsc --noEmit` — única verificação estática.
- `npx expo-doctor` e `npx expo install --check` — dependências.
- `npm audit` — vulnerabilidades.
- Teste manual no emulador/dispositivo.
- Sem lint, testes automatizados ou CI.

### Pipeline recomendada

```text
1. typecheck
2. lint
3. format check
4. unit tests (domínio, validação, storage)
5. integration tests (API mockada, import/export)
6. build
7. E2E/smoke (fluxo crítico)
8. security audit (npm audit, secrets)
9. review por subagente (somente leitura)
```

### Casos de teste prioritários para este tipo de app

- Cálculo de diárias: mesmo dia, 1 dia, múltiplos dias, último dia 0,5/1,0, ano bissexto, fuso.
- AED: um militar, múltiplos militares, múltiplos períodos.
- Storage: salvar, editar, excluir, recarregar, JSON corrompido, migração.
- Importação: JSON válido, inválido, campos faltando, arquivo grande, extensão errada.
- Exportação: nome com acentos/caracteres especiais, conteúdo esperado.
- PDF: HTML gerado, escape de HTML, valores e totais.
- API: payload real, payload inválido, timeout, HTTP 500, offline.
- Anúncio: loaded, error, closed, reward; botão desabilitado.
- Doação: URL abre, falha ao abrir.

### Definition of done

- [ ] `verify` passa (typecheck + lint + testes + build)
- [ ] teste cobre comportamento novo ou regressão
- [ ] documentação/ADR atualizado quando necessário
- [ ] sem segredos no diff
- [ ] assets atualizados quando houver mudança visual
- [ ] versão atualizada quando aplicável

---

## 8. Checklist para um novo app

### Repositório
- [ ] README com propósito, stack, comandos e requisitos reais
- [ ] LICENSE
- [ ] `.gitignore` e `.easignore` revisados
- [ ] `.env.example` / `adConfig.example.js`
- [ ] `CONTRIBUTING.md`
- [ ] template de PR e issue

### Código
- [ ] TypeScript strict
- [ ] ESLint + Prettier
- [ ] estrutura `screens/components/context/services/utils/types`
- [ ] design tokens
- [ ] error boundary
- [ ] navegação tipada
- [ ] validação nas fronteiras
- [ ] i18n desde o início, se multi-idioma

### Dados
- [ ] contrato JSON documentado
- [ ] validação runtime
- [ ] cache/offline definido
- [ ] `schemaVersion` e migração
- [ ] storage com repository
- [ ] export/import seguro

### Monetização e privacidade
- [ ] modelo de monetização definido
- [ ] IDs por ambiente
- [ ] consentimento (UMP) se necessário
- [ ] política de privacidade
- [ ] Data Safety / Nutrition Label
- [ ] aviso de dados sensíveis

### Build e operação
- [ ] `app.config.ts` com versão única
- [ ] perfis EAS
- [ ] assets completos (`icon`, `adaptive-icon`, `splash`, `favicon`)
- [ ] CI com typecheck/lint/test/build/audit
- [ ] observabilidade (crash/analytics)
- [ ] runbook de release e rollback

### Agentes de IA
- [ ] `AGENTS.md` curto e estável
- [ ] comandos de verificação
- [ ] 1 subagente revisor
- [ ] skills para tarefas repetitivas
- [ ] MCP apenas com necessidade real
- [ ] docs de arquitetura/domínio/ADRs

---

## 9. O que é específico do Cadrimil

| Item | Por que é específico |
|---|---|
| Cálculo de diárias | Regras de negócio militares, grupos, localidades, AED e último dia |
| Decretos e legislação | Conteúdo legal brasileiro e links oficiais |
| `.cmil` | Extensão e formato próprios de missão |
| Idioma | Textos em português, moeda BRL, datas `dd/MM/yyyy` |
| Identidade visual | Verde black-forest, gradiente e logo Mabesi |
| Público | Militares e uso em contexto de missão |
| Privacidade | Dados de missão locais, sem conta de usuário |

Esses itens devem ficar fora da base genérica, mas podem virar **exemplos de implementação** no padrão.

---

## 10. Perguntas para consolidação multi-projeto

Ao comparar este documento com os de outros apps, responder:

1. O app é data-driven? Os dados vêm de API, JSON bundled ou banco?
2. Precisa funcionar offline? Qual o fallback?
3. Há autenticação/multi-usuário? Isso muda storage, sync e privacidade.
4. Há dados sensíveis? Precisa de criptografia?
5. Qual o modelo de monetização? Ads, doação, assinatura, compra única?
6. Há consentimento de anúncios? Em quais regiões?
7. Quais plataformas? Android, iOS, web?
8. Há i18n? Quais idiomas?
9. Há analytics/crash reporting? Quais eventos?
10. Qual o ciclo de release? EAS, stores, OTA?
11. Qual o design system? Tokens e componentes são compartilhados?
12. Quais features são realmente `BASE`, `ADAPT` e `SPEC`?
13. Quais erros se repetem em todos os projetos?
14. Quais verificações devem ser obrigatórias no CI?
15. Qual o nível mínimo de documentação para um agente de IA trabalhar bem?

---

## 11. Anexos

### 11.1 Formato do JSON remoto do Cadrimil

```json
{
  "meta": {
    "schemaVersion": 1,
    "updatedAt": "2026-11-20T21:00:00-03:00",
    "validFrom": "2024-12-19",
    "source": "Decreto nº 12.324/2024 em www.planalto.gov.br"
  },
  "decretos": [
    { "title": "string", "decree": "string", "date": "string", "link": "string" }
  ],
  "aed": { "title": "string", "value": 95.0 },
  "grupos": { "A": "Comandantes", "B": "Oficiais-Generais" },
  "localidades": { "1": "BR, MN, RJ e SP", "2": "Demais Capitais" },
  "diarias": {
    "A": { "1": 800.0, "2": 700.0, "3": 650.0 }
  }
}
```

### 11.2 Modelos de dados do app

```ts
type Period = {
  id: string;
  grupo: string;
  localidade: string;
  dataInicio: Date;
  dataFim: Date;
  quantidadeMilitares: number;
  contarUltimoDiaInteiro: boolean;
};

type Mission = {
  id: string;
  nomeMissao: string;
  dataCriacao: string;
  periodos: Period[];
  incluirAED: boolean;
  valorTotal: number;
  decretosReferencia: Array<{ decree: string; date: string }>;
};
```

### 11.3 Comandos úteis de verificação

```bash
npx tsc --noEmit
npx expo install --check
npx expo-doctor
npm audit
npm ci
```

### 11.4 Estrutura de arquivos observada

```text
src/
├── components/
├── constants/
├── context/
├── navigation/
├── screens/
├── services/
├── types/
└── utils/
```

### 11.5 Template de envelope para arquivos exportados

```json
{
  "format": "app.entidade",
  "schemaVersion": 1,
  "exportedAt": "2026-11-20T12:00:00Z",
  "appVersion": "1.0.2",
  "data": {}
}
```

---

## 12. Próximos passos sugeridos

1. Consolidar este documento com os equivalentes de outros projetos.
2. Marcar cada lição como `BASE`, `ADAPT` ou `SPEC`.
3. Definir o conjunto mínimo `BASE` (regras, estrutura, comandos, CI, privacidade).
4. Criar `AGENTS.md`, skills e commands somente depois da consolidação.
5. Validar o padrão em um projeto piloto antes de transformá-lo em template.
6. Revisar o padrão a cada projeto concluído.

---

*Documento gerado a partir da análise do Cadrimil em 20/11/2026.*
