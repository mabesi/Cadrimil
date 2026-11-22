# AdMob no Cadrimil

Documento de referência do esquema de anúncios atualmente implementado.

## 1. Visão geral

- O app usa **somente anúncio premiado (rewarded)** do Google AdMob.
- Dependência: `react-native-google-mobile-ads` `^16.5.0`, via development build (Expo Go não suporta o módulo nativo).
- O anúncio é **opt-in**: só aparece quando o usuário abre a aba **Ajuda** e toca em **VER ANÚNCIO**.
- Não há banners, interstitials, app open ads nem anúncios automáticos.
- A recompensa atual é apenas uma mensagem de agradecimento; não desbloqueia conteúdo, moeda ou funcionalidade.
- O botão **DOAR** é independente do AdMob e abre uma página externa.
- Em desenvolvimento, usa os IDs de teste oficiais do Google.
- Em builds de release, usa os IDs configurados por ambiente. Produção com IDs de teste/exemplo é bloqueada no `app.config.ts`.
- Em produção, o consentimento UMP é solicitado antes de carregar anúncios.

## 2. Estrutura de arquivos

| Arquivo | Papel |
|---|---|
| `app.config.ts` | Resolve IDs, configura o plugin do AdMob, expõe os ad units em `extra.adMob` e valida produção. |
| `src/screens/HelpScreen.tsx` | Carrega/exibe o rewarded ad, coleta consentimento e renderiza os botões. |
| `eas.json` | Liga os perfis `development`, `preview` e `production` aos ambientes de variáveis do EAS. |
| `.env.example` | Exemplo versionado das variáveis `ADMOB_*`. |
| `.env` | Variáveis locais; ignorado pelo Git e pelo EAS. |
| `adConfig.example.js` | Exemplo versionado de configuração local via arquivo. |
| `adConfig.js` | Configuração local opcional; ignorado pelo Git. |
| `.gitignore` | Ignora `.env` e `adConfig.js`. |
| `.easignore` | Ignora `.env`; `adConfig.js`, se existir, pode ser enviado ao build como fallback. |
| `README.md` | Resumo do esquema e comandos `eas env:set`. |
| `PRIVACY_POLICY.html` | Política de privacidade com AdMob, consentimento e `.cmil`. |
| `package.json` | Dependência `react-native-google-mobile-ads` e `prop-types`. |

> `prop-types` é mantido como dependência direta porque `react-native-picker-select` o importa em runtime, embora não o declare. Removê-lo quebra o bundle.

## 3. Variáveis e precedência

### 3.1 Variáveis

| Variável | Formato | Uso |
|---|---|---|
| `ADMOB_ANDROID_APP_ID` | `ca-app-pub-<16 dígitos>~<10 dígitos>` | App ID Android no plugin. |
| `ADMOB_IOS_APP_ID` | `ca-app-pub-<16 dígitos>~<10 dígitos>` | App ID iOS no plugin. |
| `ADMOB_ANDROID_REWARDED_UNIT_ID` | `ca-app-pub-<16 dígitos>/<10 dígitos>` | Bloco premiado Android. |
| `ADMOB_IOS_REWARDED_UNIT_ID` | `ca-app-pub-<16 dígitos>/<10 dígitos>` | Bloco premiado iOS. |

### 3.2 Precedência

O `app.config.ts` resolve cada valor nesta ordem:

1. Variável de ambiente `ADMOB_*`.
2. `adConfig.js` local, se existir.
3. `adConfig.example.js` versionado.
4. Constante interna de teste do `app.config.ts`.

Para ad units, o `adConfig.js` ainda aceita o campo legado `adUnitId`, usado como fallback tanto para Android quanto para iOS. O formato preferido é:

```js
module.exports = {
    androidAppId: 'ca-app-pub-...~...',
    iosAppId: 'ca-app-pub-...~...',
    androidAdUnitId: 'ca-app-pub-.../...',
    iosAdUnitId: 'ca-app-pub-.../...',
};
```

### 3.3 IDs expostos ao runtime

O `app.config.ts` coloca os ad units em:

```ts
extra: {
    adMob: {
        androidRewardedUnitId: androidAdUnitId,
        iosRewardedUnitId: iosAdUnitId,
    },
}
```

O app lê esses valores via `Constants.expoConfig?.extra?.adMob`.

## 4. Configuração local

### Opção A — `.env` (recomendada)

```bash
cp .env.example .env
```

Depois edite `.env` com os IDs reais quando estiverem disponíveis. O arquivo `.env` não é versionado e é carregado pelo Expo CLI durante `expo start`, `expo run:*` e `expo config`.

### Opção B — `adConfig.js`

```bash
cp adConfig.example.js adConfig.js
```

Edite `adConfig.js`. Ele não é versionado. Se o arquivo não existir, o `app.config.ts` usa `adConfig.example.js`.

### IDs de teste atuais

```text
Android App ID: ca-app-pub-3940256099942544~3347511713
iOS App ID:     ca-app-pub-3940256099942544~1458002511
Rewarded Unit:  ca-app-pub-3940256099942544/5224354917
```

Esses IDs funcionam para desenvolvimento, mas **não podem ir para produção**. O build de produção é bloqueado se forem detectados.

## 5. Configuração no EAS

O `eas.json` já associa cada perfil ao seu ambiente:

```json
{
  "build": {
    "development": { "environment": "development" },
    "preview": { "environment": "preview" },
    "production": { "environment": "production" }
  }
}
```

Cadastre os IDs reais no ambiente desejado:

```bash
eas env:set --name ADMOB_ANDROID_APP_ID \
  --value "ca-app-pub-...~..." \
  --environment production --visibility sensitive

eas env:set --name ADMOB_IOS_APP_ID \
  --value "ca-app-pub-...~..." \
  --environment production --visibility sensitive

eas env:set --name ADMOB_ANDROID_REWARDED_UNIT_ID \
  --value "ca-app-pub-.../..." \
  --environment production --visibility sensitive

eas env:set --name ADMOB_IOS_REWARDED_UNIT_ID \
  --value "ca-app-pub-.../..." \
  --environment production --visibility sensitive
```

Repita para `preview`/`development` se quiser IDs diferentes por ambiente. Os IDs do AdMob são públicos no app final; a visibilidade `sensitive` serve para evitar exposição em logs.

> Sem variáveis no EAS, o build usa `adConfig.js` (se enviado) ou `adConfig.example.js`. Em produção, isso normalmente resulta em bloqueio pela guarda de release.

> Os IDs são resolvidos em tempo de build. Alterar `.env`, `adConfig.js` ou variáveis do EAS exige gerar um novo development build/release; recarregar o Metro não atualiza o valor nativo do plugin.

## 6. Resolução e guarda de produção

Fluxo do `app.config.ts`:

1. Lê as quatro variáveis `ADMOB_*`.
2. Usa `adConfig.js` como fallback.
3. Usa `adConfig.example.js` como fallback final.
4. Configura o plugin `react-native-google-mobile-ads` com os App IDs.
5. Expõe os ad units em `extra.adMob`.
6. Executa a validação de produção.

### Quando a guarda roda

Somente quando:

```text
EAS_BUILD_PROFILE=production
```

Ela valida a plataforma do build quando `EAS_BUILD_PLATFORM` está definido (`android` ou `ios`); se não estiver, valida ambas.

### O que é rejeitado

- Qualquer ID exatamente igual aos IDs de teste oficiais.
- App IDs fora do padrão `^ca-app-pub-\d{16}~\d{10}$`.
- Ad units fora do padrão `^ca-app-pub-\d{16}/\d{10}$`.

Mensagem esperada:

```text
AdMob: o build de produção não pode usar IDs de teste/exemplo...
```

### Testar a configuração

```bash
# Normal (desenvolvimento)
npx expo config --type public

# Produção com IDs de teste: deve falhar
EAS_BUILD_PROFILE=production EAS_BUILD_PLATFORM=android npx expo config --type public

# Produção com IDs válidos por plataforma: deve passar
EAS_BUILD_PROFILE=production EAS_BUILD_PLATFORM=android \
ADMOB_ANDROID_APP_ID=ca-app-pub-1111111111111111~2222222222 \
ADMOB_ANDROID_REWARDED_UNIT_ID=ca-app-pub-5555555555555555/6666666666 \
npx expo config --type public
```

> A guarda cobre builds via EAS. Builds de release feitos fora do EAS não são bloqueados automaticamente; siga o checklist manual.

## 7. Runtime na tela Ajuda

Todo o código de anúncio está em `src/screens/HelpScreen.tsx`.

### 7.1 Botões

| Botão | Ação | Depende do AdMob? |
|---|---|---|
| **DOAR** | Abre `https://apps.mabesi.dev/donate` via `Linking.openURL`. | Não |
| **VER ANÚNCIO** | Carrega/exibe o rewarded ad. | Sim |

Os dois ficam lado a lado na seção “Gostou do app? Apoie o desenvolvimento!”.

### 7.2 Seleção do ad unit

```ts
const configuredAdUnitId = Platform.OS === 'ios'
    ? Constants.expoConfig?.extra?.adMob?.iosRewardedUnitId
    : Constants.expoConfig?.extra?.adMob?.androidRewardedUnitId;

const adUnitId = __DEV__
    ? TestIds.REWARDED
    : (configuredAdUnitId || TestIds.REWARDED);
```

- `__DEV__`: sempre `TestIds.REWARDED`.
- Release (`__DEV__ === false`): usa o ad unit da plataforma vindo de `extra.adMob`.
- Se o ad unit estiver ausente, cai em `TestIds.REWARDED`; a guarda de produção deve impedir que isso chegue à loja.

### 7.3 Consentimento UMP

- Em desenvolvimento (`__DEV__`): consentimento é ignorado e o anúncio de teste é carregado.
- Em release (`__DEV__ === false`): `AdsConsent.gatherConsent()` é chamado antes de carregar o anúncio. Isso vale também para builds de `preview`, mesmo que ainda usem IDs de exemplo.
- Se `canRequestAds` for `true`, o anúncio é carregado.
- Se o consentimento for negado ou o UMP falhar, o anúncio não é carregado.
- Quando `privacyOptionsRequirementStatus === REQUIRED`, aparece o botão **Opções de privacidade**, que chama `AdsConsent.showPrivacyOptionsForm()`.

### 7.4 Ciclo do anúncio

```ts
const rewarded = useRewardedAd(
    adsAllowed ? adUnitId : null,
    { requestNonPersonalizedAdsOnly: true }
);
```

- O anúncio é carregado quando `adsAllowed` passa a ser verdadeiro.
- Após o anúncio ser fechado (`CLOSED`), um novo anúncio é carregado automaticamente.
- Ao ganhar a recompensa (`EARNED_REWARD`), o app exibe um agradecimento.
- Em erro, o botão muda para **TENTAR NOVAMENTE** e uma nova tentativa é feita ao tocar.
- Os anúncios são solicitados como **não personalizados** (`requestNonPersonalizedAdsOnly: true`).

### 7.5 Estados do botão

| Texto | Significado | Botão desabilitado? |
|---|---|---|
| `AGUARDE...` | Consentimento ainda sendo verificado. | Sim |
| `INDISPONÍVEL` | Consentimento negado, UMP falhou ou anúncios bloqueados. | Sim |
| `CARREGANDO...` | Anúncio em carregamento. | Não |
| `VER ANÚNCIO` | Anúncio carregado e pronto. | Não |
| `EXIBINDO...` | Anúncio aberto. | Não |
| `TENTAR NOVAMENTE` | Erro no carregamento. | Não |

O botão tem `disabled={!adsAllowed}`. Quando desabilitado, recebe estilo reduzido e `accessibilityState={{ disabled: true }}`.

### 7.6 Mensagens

- Carregando: `Alert.alert('Aguarde', 'Carregando anúncio...')` ao tocar antes de estar pronto.
- Indisponível: alerta informando que não foi possível carregar anúncios ou que o consentimento não foi concedido.
- Erro de carregamento: texto “Não foi possível carregar o anúncio.” abaixo dos botões.
- Recompensa: `Alert.alert('Obrigado!', 'Obrigado por apoiar o desenvolvimento do Cadrimil!')`.

### 7.7 Onde o anúncio NÃO aparece

- Calculadora, Missões, Tabelas e Decretos.
- Não há anúncio automático ao abrir o app.
- Não há anúncio ao salvar, exportar, importar ou gerar PDF.
- Não há banner fixo nem interstitial.

## 8. Fluxo resumido

```text
Abrir Ajuda
  └─ __DEV__?
       ├─ sim → adsAllowed = true → carregar TestIds.REWARDED
       └─ não → gatherConsent()
            ├─ pode solicitar? → adsAllowed = true → carregar ad unit da plataforma
            └─ não → adsAllowed = false → botão INDISPONÍVEL

Botão VER ANÚNCIO
  ├─ carregado → show()
  ├─ erro → nova tentativa
  └─ carregando → alerta “Aguarde”

Anúncio fechado
  └─ carrega outro automaticamente

Recompensa
  └─ alerta de agradecimento
```

## 9. Checklist de release

- [ ] IDs reais cadastrados no ambiente `production` do EAS.
- [ ] App IDs conferem com o console do AdMob.
- [ ] Ad units são do tipo **rewarded** e correspondem à plataforma correta.
- [ ] Mensagem de consentimento UMP configurada no AdMob para as regiões aplicáveis.
- [ ] Política de privacidade e Data Safety/Nutrition Label atualizados.
- [ ] `npx expo config --type public` carrega sem erro.
- [ ] Build de produção passa na guarda de IDs.
- [ ] Instalar em dispositivo limpo e validar:
  - [ ] consentimento aparece quando necessário;
  - [ ] anúncio carrega;
  - [ ] recompensa exibe agradecimento;
  - [ ] fechar o anúncio recarrega outro;
  - [ ] erro permite nova tentativa;
  - [ ] “Opções de privacidade” abre quando exigido;
  - [ ] botão DOAR abre a página externa.
- [ ] Confirmar que nenhum ID de teste aparece no app de produção.

## 10. Diagnóstico

| Sintoma | Causa provável | Ação |
|---|---|---|
| Botão `INDISPONÍVEL` | Consentimento negado, UMP falhou ou `adsAllowed=false`. | Verificar rede, mensagem UMP e logs de `gatherConsent`. |
| Botão `AGUARDE...` por muito tempo | Consentimento ainda não retornou. | Verificar conexão e configuração UMP. |
| Botão preso em `CARREGANDO...` | Sem preenchimento, rede ou ad unit inválido. | Conferir logs e IDs; testar com IDs de teste. |
| `TENTAR NOVAMENTE` | Erro de carregamento. | Tocar para tentar novamente; verificar console. |
| Build de produção falha com “IDs de teste/exemplo” | IDs reais não configurados ou inválidos. | Cadastrar `ADMOB_*` no EAS ou corrigir `adConfig.js`. |
| Anúncio funciona em dev, mas não em release | UMP não configurado, IDs de produção inválidos ou consentimento negado. | Validar console do AdMob, ambiente do EAS e fluxo de consentimento. |
| Build usa IDs antigos | Variável de ambiente/EAS desatualizada ou cache local. | Conferir `eas env`/painel, limpar cache e refazer o build. |
| `Unable to resolve "prop-types"` | Dependência implícita do `react-native-picker-select` removida. | Reinstalar `prop-types` e validar `expo export`. |
| DOAR não abre | URL/navegador/rede indisponível. | Testar `Linking.openURL` no dispositivo. |

## 11. Segurança e privacidade

- IDs do AdMob não são segredos: ficam embutidos no app. A separação por ambiente serve para evitar confusão e publicação acidental de IDs de teste.
- `.env` e `adConfig.js` não são versionados.
- `adConfig.example.js` e `.env.example` são versionados com IDs de teste.
- `requestNonPersonalizedAdsOnly: true`.
- UMP é solicitado em produção antes de carregar anúncios.
- A política de privacidade documenta AdMob, consentimento e exportação `.cmil`.
- Não há analytics, crash reporting ou eventos de receita de anúncio.

## 12. Pendências e limitações

- Ainda não há IDs reais; portanto, builds de produção permanecem bloqueados por design.
- A mensagem de consentimento UMP precisa existir no console do AdMob; se `gatherConsent` falhar, os anúncios ficam indisponíveis.
- A recompensa não desbloqueia nada; é apenas um agradecimento.
- O fluxo iOS não foi validado neste ambiente. A configuração de UTI/document type para `.cmil` também está pendente (não relacionada ao AdMob).
- Não há verificação server-side de recompensa.
- `version` e `versionCode` continuam manuais.
