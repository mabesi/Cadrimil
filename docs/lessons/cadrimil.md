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
| Fonte de dados | JSON remoto (`api.json`) + AdMob via `ADMOB_*` / `adConfig.js` / `adConfig.example.js` |
| Monetização | Link de doação externo + anúncio premiado (AdMob) com UMP |
| Distribuição | EAS Build (development, preview, production) |
| Testes e CI | Vitest + GitHub Actions |
| Última revisão | 21/11/2026 |
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
| L-014 | Verificação automatizada antes de entregar | `BASE` | Parcial |
| L-015 | Documentação verificada contra o código | `BASE` | Adotado |
| L-016 | Dependências, lockfile e auditoria | `BASE` | Adotado |
| L-017 | Configuração local obrigatória e não versionada | `BASE` | Adotado |
| L-018 | Funcionamento offline e cache | `ADAPT` | Adotado |
| L-019 | Estados de erro, carregamento e vazio | `BASE` | Parcial |
| L-020 | Segurança de importação, exportação e HTML | `BASE` | Parcial |
| L-021 | Versionamento de schema e migração de dados | `BASE` | Parcial |
| L-022 | Acessibilidade e testIDs | `BASE` | Parcial |
| L-023 | Safe area, teclado e layout por plataforma | `BASE` | Parcial |
| L-024 | Observabilidade e relatórios de erro | `ADAPT` | Pendente |
| L-025 | Lições de uso de agentes de IA | `BASE` | Adotado |
| L-026 | Cálculo total e individual por participante | `ADAPT` | Adotado |
| L-027 | Timeout e retry seletivo na API | `BASE` | Adotado |
| L-028 | Cache monotônico e contrato completo da matriz | `BASE` | Adotado |
| L-029 | Importação validada e confirmação de substituição | `BASE` | Adotado |
| L-030 | Anúncios por ambiente com guarda de release | `BASE` | Adotado |
| L-031 | Testes unitários puros e CI mínimo | `BASE` | Adotado |
| L-032 | Dependências implícitas e lockfile | `ANTI` | Adotado |

---

## 1. Resumo executivo

### O que funcionou bem

- **Aplicativo data-driven**: tabelas, grupos, localidades, AED e decretos vêm de um JSON remoto. O app não precisa de nova versão para atualizar valores.
- **Separação de responsabilidades**: `DataContext` cuida dos dados remotos; `MissionContext` cuida do estado da missão; `services` cuidam de I/O; `utils` guardam regras puras.
- **Componentes reutilizáveis**: `CustomButton`, `CustomInput`, `CustomSelect`, `CustomCheckbox`, `PeriodCard` e `MissionCard` reduzem duplicação visual.
- **Design tokens enxutos**: paleta e estilos globais centralizados; tokens sem uso foram removidos.
- **Intercâmbio de dados**: exportação `.cmil` com datas portáveis, importação validada, deep link filtrado e confirmação antes de substituir o cálculo atual.
- **PDF via HTML**: `expo-print` + `expo-sharing` com template visual consistente e escape de HTML.
- **Monetização discreta**: doação por link externo e anúncio premiado opt-in, com IDs por ambiente, guarda de release e consentimento UMP.
- **Build reprodutível**: `app.config.ts` com variáveis `ADMOB_*`, `eas.json` com ambientes e versões manuais explícitas.
- **Robustez de dados**: timeout de API, retry apenas para falhas transitórias, cache monotônico e validação completa da matriz de diárias.
- **Qualidade**: navegação tipada, acessibilidade básica, testes unitários com Vitest e CI no GitHub Actions.
- **Correções com evidência**: logs de build, `expo-doctor`, `expo install --check`, `npm audit`, `tsc`, `npm test` e `expo export` foram usados para validar mudanças.

### O que precisa amadurecer

- **Sem lint nem testes de integração/E2E**: há testes unitários e CI para typecheck/testes, mas ainda faltam lint, integração e E2E.
- **Atualização offline ainda básica**: há fallback, timeout, retry e cache monotônico, mas falta sincronização em background e teste automatizado do fluxo.
- **Versionamento de schema incompleto**: o JSON remoto é validado com `schemaVersion` exato; as missões salvas ainda não têm versão nem migração.
- **Strings em português hardcoded**: não há i18n.
- **Sem observabilidade**: não há crash reporting, analytics ou logs estruturados.
- **Dívidas de tipagem restantes**: casts de normalização de dados legados e uso de `expo-file-system/legacy`.
- **Privacidade incompleta**: UMP implementado e política revisada, mas faltam Data Safety/Nutrition Label e revisão jurídica formal.
- **iOS pendente**: declaração de UTI/document type para abrir `.cmil` compartilhado e validação do date picker no iOS.

---

## 2. Estratégias que funcionaram

| Estratégia | Como apareceu no Cadrimil | Tag | Por que reutilizar |
|---|---|---|---|
| Dados externos em JSON | `https://apps.mabesi.dev/cadrimil/api.json` alimenta tabelas, grupos, localidades, AED e decretos | `BASE` | Atualização de conteúdo sem publicar novo app |
| Fallback offline em 3 camadas | API → cache local → JSON embutido, com banner de origem e data | `BASE` | Garante cálculo na primeira execução offline |
| Timeout e retry seletivo | `AbortController` com 10s por tentativa; retry só para rede/timeout/5xx/408/429 | `BASE` | Evita travar em rede ruim e repetir erros definitivos |
| Cache monotônico | Resposta da API só substitui dados se `meta.updatedAt` for pelo menos tão novo | `BASE` | Impede regressão silenciosa de tabela |
| Validação de contrato | `isCadrimilData` exige matriz completa grupos × localidades e `schemaVersion` exato | `BASE` | Evita crash e dados parciais na UI |
| Contextos separados | `DataContext` (remoto) e `MissionContext` (local/UI) | `BASE` | Reduz acoplamento e facilita testes |
| Cálculos puros | `getValorDiaria`, `calcularDiarias`, `calculateTotal` | `BASE` | Regras testáveis, sem dependência de React |
| Componentes genéricos | Botões, inputs, selects, checkbox, cards | `BASE` | Consistência visual e menos código repetido |
| Design tokens | `Colors` e `GlobalStyles`, apenas tokens usados | `BASE` | Tema centralizado e mudanças globais seguras |
| Arquivo de intercâmbio | `.cmil` com JSON interno + `Sharing` | `ADAPT` | Backup, compartilhamento e integração entre usuários |
| Importação validada | `readMissionFile` valida JSON, datas, IDs, campos e legado antes de carregar | `BASE` | Evita estado inválido e crash por arquivo malformado |
| Deep link de arquivo | `file://` só para `.cmil`; `content://` validado; navegação ignora arquivos | `ADAPT` | Abrir missão direto do WhatsApp/gerenciador sem competir com rotas |
| PDF por HTML | Template HTML + `Print.printToFileAsync` + `Sharing` + `escapeHtml` | `ADAPT` | Layout rico sem biblioteca pesada de PDF |
| Monetização opt-in | Doação por link + rewarded ad com UMP e recarga após fechar | `ADAPT` | Receita sem bloquear funcionalidade principal |
| Config por ambiente | `ADMOB_*` → `adConfig.js` → `adConfig.example.js`, com guarda de produção | `BASE` | Evita publicar IDs de teste e separa dev/preview/prod |
| Perfis EAS | `development`, `preview` e `production` vinculados a ambientes de variáveis | `BASE` | Builds previsíveis e separação de ambiente |
| Testes puros e CI | Vitest para cálculos/validação e GitHub Actions com typecheck/testes | `BASE` | Feedback rápido sem depender de emulador |
| Auditoria de dependências | `expo install --check`, `expo-doctor`, `npm audit` e `expo export` | `BASE` | Evita incompatibilidade e quebra de bundle |
| Commits pequenos | Dependências, renomeação, limpeza e docs em commits separados | `BASE` | Histórico legível e reversão segura |
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
  - **Prevenção**: checklist de assets (`icon`, `adaptive-icon`, `splash`) em todo redesign.
  - **Tag**: `ANTI`.

### 3.2 Dados, contratos e persistência

- **Confiar no JSON da API apenas por type assertion**.
  - **Impacto**: dados inválidos entram no estado e quebram a UI.
  - **Prevenção**: validar em runtime na fronteira (`isCadrimilData`), com mensagem de erro específica fora do `catch` de rede.
  - **Tag**: `BASE`.

- **Ausência de cache/offline** (corrigido).
  - **Impacto**: sem internet, o app não calcula.
  - **Prevenção**: persistir o último payload válido, exibir dados em cache e indicar “dados podem estar desatualizados”. Hoje há fallback em três camadas e cache monotônico.
  - **Tag**: `ADAPT`.

- **`schemaVersion` ausente nas missões salvas** (o JSON remoto já possui).
  - **Impacto**: mudanças futuras de formato quebram dados antigos.
  - **Prevenção**: incluir `schemaVersion`, `updatedAt` e migrações explícitas também no storage local.
  - **Tag**: `BASE`.

- **Importação validava apenas `periodos` como array** (corrigido).
  - **Impacto**: arquivo malformado ou malicioso podia causar erro em tempo de execução.
  - **Prevenção**: validar o envelope completo, limites de tamanho, tipos e campos obrigatórios. Hoje `readMissionFile` valida JSON, datas, quantidade, grupo/localidade e IDs, com mensagens específicas.
  - **Tag**: `BASE`.

- **`saveMission` redefinia `dataCriacao` ao editar** (corrigido).
  - **Impacto**: a data original da missão era perdida.
  - **Prevenção**: preservar `dataCriacao` ao atualizar; considerar `updatedAt` separado.
  - **Tag**: `ANTI`.

- **Storage corrompido retornava lista vazia e podia ser sobrescrito** (corrigido).
  - **Impacto**: perda permanente de missões após um JSON inválido e um novo salvamento.
  - **Prevenção**: diferenciar “sem dados” de “corrompido”; manter a lista em memória e bloquear escritas até intervenção.
  - **Tag**: `ANTI`.

- **Resposta antiga da API podia substituir cache mais novo** (corrigido).
  - **Impacto**: regressão silenciosa de tabela de valores.
  - **Prevenção**: comparar `meta.updatedAt` e só aceitar payload pelo menos tão novo quanto o atual.
  - **Tag**: `BASE`.

- **Validação aceitava matriz de diárias incompleta** (corrigido).
  - **Impacto**: combinação grupo/localidade ausente podia quebrar a tabela ou gerar R$ 0.
  - **Prevenção**: exigir todas as linhas e células; a UI também trata ausência com `N/D` e a calculadora bloqueia períodos sem valor.
  - **Tag**: `BASE`.

- **IDs de período com `Date.now()`** (corrigido).
  - **Impacto**: colisão ao criar itens no mesmo milissegundo.
  - **Prevenção**: gerador com timestamp + sufixo aleatório e deduplicação na importação.
  - **Tag**: `BASE`.

- **`DateHelpers.toISOString` retorna `yyyy-MM-dd`, não ISO completo**.
  - **Impacto**: nome enganoso e risco de bugs de fuso.
  - **Prevenção**: renomear para `toDateString` ou documentar; testar fusos/DST. A exportação `.cmil` e o storage usam o mesmo formato date-only.
  - **Tag**: `ANTI`.

- **Regra do AED ambígua**.
  - **Impacto**: o AED é multiplicado pelo total de militares de todos os períodos; se o mesmo militar aparecer em vários trechos, pode contar mais de uma vez.
  - **Prevenção**: documentar a regra de negócio e cobrir com testes. A calculadora agora exibe o AED histórico da missão, mas a regra de negócio ainda precisa de validação formal.
  - **Tag**: `SPEC`.

- **Cálculo de diárias sem testes de borda** (parcialmente corrigido).
  - **Impacto**: mesmo dia, último dia 0,5/1,0, ano bissexto e fuso podem gerar valores errados.
  - **Prevenção**: testes unitários com tabela de casos. Há cobertura inicial em Vitest para diárias, AED e valores históricos; faltam fusos/DST e regra formal do AED.
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

- **`adConfig.js` obrigatório, mas ignorado pelo Git** (corrigido).
  - **Impacto**: clone novo não conseguia carregar `app.config.ts`.
  - **Prevenção**: `app.config.ts` usa `ADMOB_*` → `adConfig.js` → `adConfig.example.js`; clone funciona com IDs de exemplo e produção falha com mensagem clara.
  - **Tag**: `BASE`.

- **`.gitignore` e `.easignore` com regras diferentes**.
  - **Impacto**: `adConfig.js` não vai para o Git, mas vai para o build EAS; isso pode ser intencional, mas precisa estar documentado.
  - **Prevenção**: revisar os dois arquivos juntos e documentar o que é local, o que vai para o build e o que é segredo.
  - **Tag**: `BASE`.

- **Pasta `android/` gerada localmente e ignorada**.
  - **Impacto**: drift entre máquinas e builds; mudanças nativas não versionadas.
  - **Prevenção**: usar CNG/prebuild de forma consciente; se precisar de código nativo, versionar ou usar config plugin.
  - **Tag**: `BASE`.

- **IDs de anúncio test/real alternados manualmente** (corrigido).
  - **Impacto**: risco de publicar ID de teste ou usar ID real em desenvolvimento.
  - **Prevenção**: IDs por ambiente (`ADMOB_*` no EAS, `adConfig.js` local e exemplo versionado), validação de formato e bloqueio de build de produção com IDs de teste.
  - **Tag**: `ANTI`.

- **Dependência implícita de `prop-types`**.
  - **Impacto**: remover `prop-types` do `package.json` quebrou o bundle, pois `react-native-picker-select` o importa em runtime sem declará-lo.
  - **Prevenção**: validar build/export após remover dependências; manter dependências implícitas documentadas.
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

- **Cabeçalho com `paddingTop: 48` fixo** (corrigido).
  - **Impacto**: sobreposição com notch/status bar em alguns dispositivos.
  - **Prevenção**: usar `useSafeAreaInsets` em headers e telas. O `Header` e a Ajuda agora usam insets.
  - **Tag**: `BASE`.

- **`LayoutAnimation` no Android sem habilitar `UIManager.setLayoutAnimationEnabledExperimental`**.
  - **Impacto**: animação pode não funcionar.
  - **Prevenção**: habilitar no Android ou usar `Animated`/Reanimated.
  - **Tag**: `ANTI`.

- **Ícones por emoji** (parcialmente corrigido).
  - **Impacto**: aparência varia por plataforma; inicialmente faltavam `accessibilityLabel`.
  - **Prevenção**: usar biblioteca de ícones e rótulos de acessibilidade. Os botões principais ganharam labels/roles; os emojis continuam como solução visual.
  - **Tag**: `BASE`.

- **Cabeçalho global duplicado na Ajuda** (corrigido).
  - **Impacto**: duas barras de topo e botão de ajuda dentro da própria Ajuda.
  - **Prevenção**: manter o header dentro do layout das abas e deixar a tela de Ajuda com cabeçalho próprio e safe area.
  - **Tag**: `ANTI`.

- **Date picker iOS sem forma de fechar** (corrigido).
  - **Impacto**: spinner permanecia aberto indefinidamente.
  - **Prevenção**: botão “Concluir” no iOS e fechamento do seletor oposto ao abrir um novo.
  - **Tag**: `BASE`.

- **Alertas para todos os erros**.
  - **Impacto**: UX inconsistente e difícil de testar.
  - **Prevenção**: separar erros de validação, rede e domínio; usar inline errors/toasts e error boundary.
  - **Tag**: `BASE`.

### 3.5 Qualidade, segurança e operação

- **Ausência de ESLint/Prettier; testes e CI adicionados** (parcialmente corrigido).
  - **Impacto**: erros só aparecem em runtime ou em revisão manual.
  - **Prevenção**: pipeline mínima (`typecheck`, `lint`, `test`, `build`) e branch protection. Hoje há typecheck, Vitest e CI; faltam lint/format e testes de integração.
  - **Tag**: `BASE`.

- **Uso de `any`, `as never` e `@ts-ignore`** (corrigido).
  - **Impacto**: perda de segurança de tipos em navegação, imports e file system.
  - **Prevenção**: tipos de navegação, `unknown` + validação, e eliminação gradual de supressões. Restam apenas casts pontuais de normalização de dados legados.
  - **Tag**: `ANTI`.

- **PDF interpola nome da missão e textos sem escape HTML** (corrigido).
  - **Impacto**: HTML injetado pode quebrar o layout ou simular conteúdo.
  - **Prevenção**: função `escapeHtml` para todo texto dinâmico.
  - **Tag**: `BASE`.

- **Deep link aceita qualquer `content://` ou `file://`** (corrigido).
  - **Impacto**: tenta interpretar arquivos arbitrários como missão.
  - **Prevenção**: `file://` só para `.cmil`, `content://` validado por conteúdo, temporário removido e erros exibidos ao usuário.
  - **Tag**: `BASE`.

- **AsyncStorage sem criptografia**.
  - **Impacto**: dados de missão ficam legíveis no dispositivo.
  - **Prevenção**: avaliar `expo-secure-store`/banco criptografado se houver dado sensível; avisar no export.
  - **Tag**: `ADAPT`.

- **Sem crash reporting/analytics**.
  - **Impacto**: erros em produção passam despercebidos.
  - **Prevenção**: Sentry/Bugsnag + eventos de funil, respeitando privacidade e consentimento.
  - **Tag**: `ADAPT`.

- **Política de privacidade desatualizada** (corrigido).
  - **Impacto**: risco de reprovação na loja e inconsistência legal.
  - **Prevenção**: revisar a política a cada mudança de dados/anúncios; mapear dados coletados. A política foi atualizada para 2026 com consentimento e `.cmil`.
  - **Tag**: `BASE`.

- **Sem consentimento de anúncios (UMP/EEA)** (corrigido).
  - **Impacto**: risco de conformidade e de personalização indevida.
  - **Prevenção**: `AdsConsent.gatherConsent` antes de carregar anúncios em produção, com acesso às opções de privacidade.
  - **Tag**: `BASE`.

- **Sem `schemaVersion`/migração para dados locais**.
  - **Impacto**: atualização futura pode invalidar missões salvas.
  - **Prevenção**: versão no storage + migrações testadas. O JSON remoto já usa `schemaVersion` exato; o storage local ainda não.
  - **Tag**: `BASE`.

### 3.6 Rodada de endurecimento (Nov/2026)

- **API com timeout e retry seletivo** (`L-027`).
  - **Decisão**: `AbortController` com 10s por tentativa; repetir apenas rede, timeout, 5xx, 408 e 429; não repetir 4xx, JSON inválido ou contrato inválido.
  - **Efeito**: menos espera em rede ruim e menos tentativas inúteis.
  - **Tag**: `BASE`.

- **Cache monotônico e contrato completo** (`L-028`).
  - **Decisão**: só aceitar payload com `updatedAt` pelo menos tão novo; exigir matriz completa de grupos × localidades e `schemaVersion` exato.
  - **Efeito**: evita regressão de tabela, cache incompatível e combinações ausentes.
  - **Tag**: `BASE`.

- **Importação/exportação endurecidas** (`L-029`).
  - **Decisão**: formato `.cmil` com datas `yyyy-MM-dd`, validação de JSON/datas/IDs, confirmação antes de substituir cálculo, deep link `file://` restrito a `.cmil` e `content://` validado por conteúdo.
  - **Efeito**: round-trip portável e menor risco de estado inválido.
  - **Tag**: `BASE`.

- **AdMob por ambiente** (`L-030`).
  - **Decisão**: `ADMOB_*` no EAS, fallback local/exemplo, guarda de produção por plataforma, UMP antes do anúncio, recarga após `CLOSED` e retry em erro.
  - **Efeito**: reduz risco de publicar ID de teste e mantém o botão funcional após consumir o anúncio.
  - **Tag**: `BASE`.

- **Testes e CI** (`L-031`).
  - **Decisão**: Vitest para utilitários puros (cálculos, validação, agrupamento, formatação), script `typecheck` e workflow com `npm ci`, typecheck, testes e `expo-doctor`.
  - **Efeito**: feedback rápido sem emulador e regressões de domínio detectadas cedo.
  - **Tag**: `BASE`.

- **Dependências implícitas** (`L-032`).
  - **Decisão**: manter `prop-types` no `package.json` porque `react-native-picker-select` o importa em runtime sem declarar; validar com `expo export` após remover dependências.
  - **Efeito**: evita bundle quebrado por limpeza aparentemente segura.
  - **Tag**: `ANTI`.

- **Navegação e acessibilidade**.
  - **Decisão**: `RootStackParamList`/`MainTabParamList`, header dentro das abas, Ajuda com header próprio, safe area, `StatusBar` escuro na Ajuda e labels/roles nos controles principais.
  - **Efeito**: remove cabeçalho duplicado, corrige sobreposição e melhora leitores de tela.
  - **Tag**: `BASE`.

- **Limpeza de código morto**.
  - **Decisão**: remover `LoadingSpinner`, APIs de storage sem uso, tokens/estilos/cores/imports órfãos e assets não referenciados; manter apenas o necessário.
  - **Efeito**: menos superfície de manutenção e bundle mais enxuto.
  - **Tag**: `BASE`.

---

## 4. Funcionalidades reutilizáveis em outros projetos

### 4.1 Dados e configurações via JSON remoto

**O que é**: um endpoint retorna um JSON com conteúdos e parâmetros que o app consome em vez de hardcodar.

**No Cadrimil**:
- `src/services/api.ts` busca `https://apps.mabesi.dev/cadrimil/api.json`.
- `src/context/DataContext.tsx` carrega cache, depois API, com retry seletivo e cache monotônico.
- `src/utils/validation.ts` exige contrato completo: todos os grupos, todas as localidades e `schemaVersion` exato.
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
- Tratar offline, timeout, HTTP 4xx/5xx e JSON inválido. O Cadrimil usa timeout de 10s e repete apenas falhas transitórias.
- Exibir estado de erro com opção de tentar novamente.
- Não bloquear a UI inteira sem necessidade.
- Não substituir cache/dados atuais por resposta com `updatedAt` mais antigo.

**Tag**: `BASE`.

### 4.2 Validação de contrato em runtime

**O que é**: validar o formato dos dados antes de usá-los.

**No Cadrimil**:
- `isCadrimilData` verifica objetos, arrays, strings não vazias, números finitos/não negativos, `schemaVersion` exato e matriz completa de `diarias`.
- A validação fica fora do `catch` de rede para não mascarar erro de contrato como erro de conexão.
- A mesma função valida API, cache local e JSON embutido; cache incompatível é descartado.

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
- JSON corrompido não é sobrescrito: leituras sinalizam corrupção e escritas são recusadas.
- Missões mantêm `dataCriacao` ao editar e valores históricos de diária/AED.
- IDs de missão/período usam timestamp + sufixo aleatório e são deduplicados na importação.

**Como generalizar**:
- Criar uma interface `Repository<T>` (`list`, `get`, `save`, `remove`, `clear`).
- Namespacear chaves por app/entidade.
- Incluir `schemaVersion` e migrações.
- Persistir snapshots de valores (preço unitário, taxa) usados no lançamento; não recalcular registros históricos com a tabela atual.
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
- Exportação `.cmil` com JSON interno via `FileSystem` + `Sharing`; datas dos períodos em `yyyy-MM-dd`.
- `src/utils/missionSerialization.ts` centraliza a serialização usada pelo storage e pela exportação.
- `src/utils/missionImport.ts` centraliza leitura, validação e normalização; aceita JSON e legado.
- `DocumentPicker` aceita `application/json`, `application/octet-stream` e `text/plain` no Android; no iOS usa seletor amplo.
- Deep link de arquivo: `file://` só para `.cmil`; `content://` é copiado para cache, validado e removido.
- A navegação ignora URLs de arquivo para não competir com o handler de importação.
- Confirmação antes de substituir um cálculo em andamento.

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
- `DocumentPicker` com apenas `application/json` pode não listar `.cmil`; incluir tipos alternativos.
- Deep link que aceita qualquer `file://`/`content://` é amplo demais; validar extensão e conteúdo.
- Exportar dados sensíveis exige aviso ao usuário.
- O `.cmil` atual ainda não usa envelope versionado; avaliar `format`/`schemaVersion`/`appVersion` em versão futura.

**Tag**: `ADAPT`.

### 4.5 Geração de PDF via HTML

**O que é**: montar HTML e converter em PDF com `expo-print`, compartilhando com `expo-sharing`.

**No Cadrimil**:
- `src/utils/pdfGenerator.ts` gera HTML com cabeçalho, tabela de períodos, AED, total e referências legais.
- Nome da missão, grupos, localidades e decretos passam por `escapeHtml`.
- Nome do arquivo é sanitizado (sem acentos/caracteres especiais).
- Fallback para `Print.printAsync` se compartilhamento não estiver disponível.

**Como generalizar**:
- Separar template, dados e estilo.
- Usar os mesmos design tokens do app (gerar CSS a partir deles).
- Escapar todo texto dinâmico (`escapeHtml`).
- Incluir rodapé com versão, data e aviso legal.
- Testar o HTML gerado com snapshot.

**Cuidados**:
- Interpolação direta de nome da missão no HTML; usar `escapeHtml`.
- Nomes de arquivo inválidos/longos.
- Diferenças de renderização entre iOS/Android.

**Tag**: `ADAPT`.

### 4.6 Doação externa + anúncio premiado

**O que é**: monetização opcional sem bloquear o uso.

**No Cadrimil**:
- Botão **DOAR** abre `https://apps.mabesi.dev/donate` via `Linking.openURL`.
- Botão **VER ANÚNCIO** usa `useRewardedAd` do `react-native-google-mobile-ads`.
- IDs vêm de `ADMOB_*` (EAS), `adConfig.js` ou `adConfig.example.js`, com guarda de produção por plataforma.
- Em desenvolvimento, usa `TestIds.REWARDED`; em produção, escolhe o bloco Android/iOS conforme `Platform.OS`.
- `AdsConsent.gatherConsent()` roda antes de carregar anúncios em produção; “Opções de privacidade” fica disponível quando exigido.
- O anúncio recarrega após `CLOSED` e permite nova tentativa após erro.
- `requestNonPersonalizedAdsOnly: true` foi escolhido.
- Ao ganhar a recompensa, exibe agradecimento.

**Como generalizar**:
- Criar um `MonetizationConfig`:
```ts
type MonetizationConfig = {
  donationUrl: string;
  androidRewardedAdUnitId: string;
  iosRewardedAdUnitId: string;
  rewardedEnabled: boolean;
  testMode: boolean;
};
```
- Usar um hook para rewarded ad com estados `loading`, `loaded`, `error`, `showing` e eventos `LOADED`, `ERROR`, `CLOSED`, `EARNED_REWARD`.
- Separar IDs por ambiente e plataforma; validar formato e bloquear produção com IDs de teste.
- Ter fallback se o anúncio não carregar e recarregar após fechar.
- Respeitar consentimento (UMP) e política de privacidade.

**Cuidados**:
- Sem listener de `ERROR`, o botão pode ficar eternamente desabilitado.
- Sem recarregar após `CLOSED`, o anúncio é consumido e o botão para de funcionar.
- Não interromper o uso principal com anúncio.
- Não usar ID real em desenvolvimento nem ID de teste em produção.
- Doação externa precisa de página confiável e política de loja adequada.

**Tag**: `ADAPT`.

### 4.7 Design tokens e componentes reutilizáveis

**O que é**: centralizar cores, tipografia, espaçamento e componentes visuais.

**No Cadrimil**:
- `src/constants/colors.ts`, `styles.ts`.
- Componentes: `CustomButton`, `CustomInput`, `CustomSelect`, `CustomCheckbox`, `PeriodCard`, `MissionCard`.
- `Header` com `LinearGradient`.
- Tokens/estilos/cores sem uso foram removidos; `GlobalStyles` mantém apenas container, card e cardSecondary.
- Componentes principais expõem `accessibilityRole`, `accessibilityLabel` e estados quando aplicável.

**Como generalizar**:
- Tokens semânticos (`primary`, `surface`, `danger`, `textMuted`) em vez de nomes de cor.
- Tema claro/escuro desde o início, se houver intenção.
- Componentes com variantes e estados (`disabled`, `loading`, `error`).
- `accessibilityLabel`, `accessibilityRole`, `accessibilityState` e área mínima de toque.
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
- `RootStackParamList` e `MainTabParamList` em `src/navigation/types.ts`.
- header principal dentro do layout das abas; Ajuda com header próprio.
- `useSafeAreaInsets` no tab bar, no header e na Ajuda.
- `StatusBar` escuro na Ajuda e claro nas abas.
- `NavigationContainer` com linking e `DeepLinkHandler`; navegação ignora URLs de arquivo.

**Como generalizar**:
- Tipar `RootStackParamList` e `TabParamList`.
- Constantes de rota em vez de strings soltas.
- Mapa único de deep links.
- Safe area em todas as telas/headers.
- Testar navegação com parâmetros e deep links.
- Evitar header global fora do navigator quando uma tela precisa de header próprio.

**Cuidados**:
- `as never` esconde erros de rota.
- Header com padding fixo.
- Dois handlers de deep link podem competir.
- Status bar claro sobre header claro fica invisível.

**Tag**: `BASE`.

### 4.9 Build, configuração e distribuição

**No Cadrimil**:
- `app.config.ts` lê `ADMOB_*`, depois `adConfig.js`, depois `adConfig.example.js`; define nome, slug, versão, package, bundle ID, ícones, splash, intent filters e plugin do AdMob.
- Builds de produção validam formato e rejeitam IDs de teste/exemplo por plataforma.
- `eas.json` com perfis `development` (dev client + APK), `preview` (APK) e `production`, cada um com `environment`.
- `extra.eas.projectId` vincula o projeto ao EAS.
- `versionCode` e `version` continuam explícitos e manuais.
- Splash/ícone usam `#71FA55`; web foi removido.

**Como generalizar**:
- `app.config.ts` lê variáveis de ambiente por perfil.
- IDs de anúncio e chaves via EAS environment variables/secrets.
- Script de release que atualiza versão em um único lugar (avaliar; hoje é manual).
- Checklist de assets e permissões.
- CI atual: `npm ci`, typecheck, testes e `expo-doctor`; recomendado adicionar lint, `expo install --check` e build.
- Documentar `android/` gerado e o que é CNG.

**Cuidados**:
- Versão divergente entre arquivos.
- `adConfig.js` ausente no clone; fallback versionado evita falha, mas produção exige IDs reais.
- `.easignore` diferente do `.gitignore`; `.env` local não deve subir.
- Testar build nativo cedo, não só o Metro.
- Validar `expo export` após remover dependências.

**Tag**: `BASE`.

### 4.10 Cálculo total vs. individual por participante

**O que é**: manter duas visões de valor para a mesma entidade: o total da equipe e o valor individual de um participante.

**No Cadrimil**:
- `Mission.valorTotal` continua sendo o total de todos os grupos e militares.
- `Period.registrarEmMinhasMissoes` marca os trechos que pertencem ao usuário.
- `calculateIndividualMissionTotal` filtra apenas os períodos marcados e calcula com quantidade 1.
- `MyMissionCard` exibe somente os períodos e valores do usuário.

**Como generalizar**:
- Armazenar o identificador do participante (grupo, usuário, e-mail ou ID).
- Separar claramente `total` de `individual` no modelo e na UI.
- Calcular o individual com quantidade 1, sem herdar a quantidade do grupo.
- Se houver rateio, definir a regra explicitamente (por período, por militar, por dia).
- Exibir a fonte do valor individual e permitir reconciliar com o total.

**Cuidados**:
- Não confundir quantidade do grupo com quantidade individual.
- Definir se o adicional (AED) é por período, por missão ou por militar.
- Participantes podem aparecer em vários períodos do mesmo grupo.
- Guardar o valor unitário por período e o AED da missão para preservar o histórico.
- Missões antigas precisam de migração/default para os novos campos.

**Tag**: `ADAPT`.

### 4.11 Privacidade, consentimento e licença

**No Cadrimil**:
- `PRIVACY_POLICY.html` descreve dados locais, AdMob, consentimento, exportação `.cmil`/PDF e contato (revisada em 2026).
- `LICENSE` MIT com copyright.
- `README` aponta para a licença.
- Dados de missão ficam locais; exportação é iniciada pelo usuário.
- UMP solicita consentimento antes de anúncios em produção e oferece “Opções de privacidade”.
- Faltam Data Safety/Nutrition Label e revisão jurídica formal.

**Como generalizar**:
- Mapa de dados: o que coleta, onde armazena, com quem compartilha, por quanto tempo.
- Política de privacidade versionada e datada.
- Consentimento para anúncios quando exigido.
- Data Safety (Google Play) e Privacy Nutrition Label (App Store) coerentes.
- Licença definida desde o início.
- Aviso sobre dados sensíveis em exportações.

**Tag**: `BASE`.

---

## 5. Arquitetura observada

```text
API JSON
  └─ src/services/api.ts (fetch + timeout 10s + retry seletivo + validação)
       └─ DataContext (cache monotônico)
            ├─ CalculatorScreen
            ├─ TablesScreen
            ├─ DecreesScreen
            └─ pdfGenerator

UI
  └─ MissionContext
       ├─ src/services/storage.ts (AsyncStorage + proteção contra corrupção)
       ├─ src/utils/missionSerialization.ts
       ├─ CalculatorScreen
       ├─ MissionsScreen
       └─ componentes

Arquivo .cmil / deep link
  └─ App.tsx ou DocumentPicker
       └─ src/utils/missionImport.ts (leitura + validação + normalização)
            └─ MissionContext (confirmação → estado)

PDF
  └─ pdfGenerator (HTML escapado) → expo-print → expo-sharing
```

### Camadas

| Camada | Arquivos | Responsabilidade |
|---|---|---|
| Apresentação | `src/screens`, `src/components` | UI, interação, estados locais |
| Navegação | `src/navigation` | Stack/tabs tipados, rotas e deep links |
| Estado | `src/context` | Dados remotos, missão atual, missões salvas |
| Serviços | `src/services` | API, storage |
| Domínio/util | `src/utils` | Cálculos, datas, formatação, PDF, validação, importação |
| Tipos | `src/types` | Contratos TypeScript |
| Config | `app.config.ts`, `eas.json` | Build, ambientes e distribuição |
| Qualidade | `src/utils/__tests__`, `.github/workflows` | Testes unitários e CI |

### O que falta para um padrão mais forte

- Camada de domínio explícita (`src/domain`) separada de UI.
- Interfaces de repositório e casos de uso.
- Error boundary global.
- Camada de i18n.
- Camada de observabilidade.
- Testes de integração/E2E e lint.

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

- `npx tsc --noEmit` / `npm run typecheck` — verificação estática.
- `npx expo-doctor` e `npx expo install --check` — dependências.
- `npm audit` — vulnerabilidades.
- `npm test` — testes unitários com Vitest.
- CI no GitHub Actions: `npm ci`, typecheck, testes e `expo-doctor`.
- Teste manual no emulador/dispositivo.
- Sem lint, testes de integração ou E2E.

**Cobertura atual**: 21 testes em 4 arquivos, cobrindo cálculo de diárias, AED, valores históricos, validação do contrato, agrupamento por ano e formatação monetária. Ainda não há testes de storage, importação, PDF, API ou UI.

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

- [ ] `npm run typecheck`, `npm test`, lint e build passam
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
- [ ] assets completos (`icon`, `adaptive-icon`, `splash`)
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

> A validação atual exige `schemaVersion: 1`, todas as linhas de `grupos` e todas as células de `localidades` em `diarias`.

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
  valorUnitario: number;
  registrarEmMinhasMissoes: boolean;
};

type Mission = {
  id: string;
  nomeMissao: string;
  dataCriacao: string;
  periodos: Period[];
  incluirAED: boolean;
  aedValue: number;
  tabelaMeta: CadrimilMeta;
  valorTotal: number;
  decretosReferencia: Array<{ decree: string; date: string }>;
};
```

### 11.3 Comandos úteis de verificação

```bash
npm run typecheck
npm test
npx expo install --check
npx expo-doctor
npm audit
npx expo export --platform android
npm ci
```

### 11.4 Estrutura de arquivos observada

```text
src/
├── components/
├── constants/
├── context/
├── navigation/          # inclui types.ts com param lists
├── screens/
├── services/
├── types/
└── utils/
    └── __tests__/       # Vitest
.github/workflows/       # CI
```

### 11.5 Template de envelope para arquivos exportados

> O `.cmil` atual exporta a missão diretamente, sem envelope. O formato abaixo é a recomendação para uma próxima versão do schema.

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

1. Fechar dívidas do Cadrimil: ESLint/Prettier, testes de integração/E2E, `schemaVersion` do storage local, declaração iOS de `.cmil`, Data Safety/Nutrition Label e observabilidade.
2. Consolidar este documento com os equivalentes de outros projetos.
3. Marcar cada lição como `BASE`, `ADAPT` ou `SPEC`.
4. Definir o conjunto mínimo `BASE` (regras, estrutura, comandos, CI, privacidade).
5. Criar `AGENTS.md`, skills e commands somente depois da consolidação.
6. Validar o padrão em um projeto piloto antes de transformá-lo em template.
7. Revisar o padrão a cada projeto concluído.

---

*Documento gerado a partir da análise do Cadrimil em 20/11/2026 e atualizado em 21/11/2026.*
