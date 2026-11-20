# CADRIMIL APP

![Cadrimil Logo](./assets/logo_header.png)

**Cadrimil** é um aplicativo móvel desenvolvido com React Native e Expo para auxiliar militares no cálculo de diárias de viagem. O aplicativo permite simular valores a receber com base no posto/graduação, localidade e período da missão, além de fornecer acesso rápido às tabelas de valores e legislação vigente.

## 📱 Funcionalidades

- **Calculadora de Diárias**: Simule valores inserindo múltiplos trechos e localidades.
- **Gerenciamento de Missões**: Salve, edite e exclua seus cálculos para consulta futura.
- **Importação e Exportação**: Exporte missões em `.cmil` (JSON) e importe arquivos `.json`. O app também reconhece e abre arquivos `.cmil` diretamente pelo sistema.
- **Tabelas de Valores**: Consulte valores atualizados de diárias e Adicional de Embarque/Desembarque (AED).
- **Funcionamento offline**: Usa a última tabela salva no dispositivo ou a tabela embutida no app quando a API não está acessível.
- **Legislação**: Acesso rápido aos decretos que regulamentam as indenizações.
- **Relatórios em PDF**: Gere e compartilhe o detalhamento dos cálculos em formato PDF.
- **Interface Moderna**: Design profissional e minimalista, com gradientes e identidade visual própria.
- **Ajuda e Suporte**: Guia passo a passo integrado e opção de doação.

## 🛠️ Tecnologias

- **React Native** (0.88.1) - Framework mobile
- **Expo SDK** (~58.0.26) - Plataforma de desenvolvimento
- **React** (19.3.0)
- **TypeScript** (~6.0.3) - Desenvolvimento tipado
- **React Navigation** (7.x) - Navegação (Stack e Bottom Tabs)
- **AsyncStorage** (^2.2.0) - Persistência de dados local
- **Google Mobile Ads / AdMob** (^16.5.0) - Anúncios
- **date-fns** (^4.1.0) - Manipulação de datas
- **Expo Dev Client** (~58.0.21) - Development builds
- **Expo Print** (~58.0.9) e **Expo Sharing** (~58.0.23) - Geração e compartilhamento de PDF
- **Expo Document Picker** (~58.0.5) e **Expo File System** (~58.0.14) - Importação e exportação de arquivos
- **Expo Linear Gradient** (~58.0.4) - Estilização visual

## 📋 Pré-requisitos

- Node.js 24 LTS (ou 22.13+) — versão suportada pelo Expo SDK 58
- npm — o projeto utiliza `package-lock.json`
- Android Studio com SDK e emulador para builds Android locais
- Xcode (macOS) para builds iOS locais
- EAS CLI para builds na nuvem: `npm install -g eas-cli`
- Conta Expo para builds via EAS

> **Expo Go não é suportado.** O projeto utiliza módulos nativos (AdMob, picker, etc.), portanto é necessário usar um development build.

## ⚙️ Configuração inicial

O `app.config.ts` importa o arquivo `adConfig.js`, que não é versionado (está no `.gitignore`). Crie-o na raiz do projeto antes de iniciar o app:

```js
module.exports = {
    androidAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
    iosAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
    adUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};
```

Durante o desenvolvimento, utilize os IDs de teste do AdMob. Sem esse arquivo, o Expo não consegue carregar a configuração do aplicativo.

## 🚀 Instalação e execução

1. **Clone o repositório**
```bash
git clone https://github.com/mabesi/cadrimil.git
cd cadrimil
```

2. **Instale as dependências**
```bash
npm ci
```

> Use `npm install` caso precise adicionar ou atualizar dependências.

3. **Gere e instale o development build**

   Com um emulador ou dispositivo conectado:
   ```bash
   npm run android  # Android (expo run:android)
   npm run ios      # iOS (expo run:ios, requer macOS/Xcode)
   ```

   Esses comandos geram a pasta nativa `android/`/`ios/` localmente e instalam o app no dispositivo ou emulador.

4. **Inicie o servidor de desenvolvimento**

   Depois que o development build estiver instalado:
   ```bash
   npm start
   # ou
   npx expo start --dev-client
   ```

5. **Alternativa: development build via EAS**
   ```bash
   eas login
   eas build --platform android --profile development
   ```
   Instale o APK gerado no dispositivo e execute `npm start` para conectar ao Metro.

## 📦 Build para Produção

### Android APK (Preview)
```bash
eas build --platform android --profile preview
```

### Build de Produção
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

> O projeto já está vinculado a um projeto EAS em `app.config.ts`. Execute `eas login` antes dos builds na nuvem.

## 🗂️ Estrutura do App

```
cadrimil/
├── src/
│   ├── components/       # Componentes reutilizáveis (Header, Buttons, Cards)
│   ├── constants/        # Cores, estilos globais e dados estáticos
│   ├── context/          # Gerenciamento de estado (DataContext e MissionContext)
│   ├── navigation/       # Configuração de rotas (Stack e Tabs)
│   ├── screens/          # Telas do aplicativo (Calculator, Missions, Help, etc.)
│   ├── services/         # Serviços (API e armazenamento local)
│   ├── types/            # Definições de tipos TypeScript
│   └── utils/            # Funções utilitárias (Cálculos, Formatação, PDF e Validação da API)
├── assets/               # Imagens e ícones
├── app.config.ts         # Configuração do Expo
├── adConfig.js           # IDs do AdMob (não versionado)
├── eas.json              # Perfis de build do EAS
└── App.tsx               # Ponto de entrada da aplicação
```

> A pasta `android/` é gerada localmente por `expo run:android`/prebuild e não é versionada.

## 📄 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).

## ⚠️ Isenção de Responsabilidade

O uso desta ferramenta, para qualquer finalidade, ocorre por sua conta e risco, sendo de sua inteira responsabilidade as implicações legais decorrentes.

É também responsabilidade do usuário final conhecer e obedecer a todas as leis locais, estaduais e federais aplicáveis. Os desenvolvedores não assumem responsabilidade e não são responsáveis por qualquer mau uso ou dano causado por este programa.

## 👨‍💻 Autor

**Plinio Mabesi**
- GitHub: [@mabesi](https://github.com/mabesi)
- Email: pliniomabesi@gmail.com

## 🤝 Contribuição

Contribuições, issues e solicitações de funcionalidades são bem-vindas!

## ⭐ Apoie o projeto

Dê uma ⭐️ se este projeto te ajudou!

---

Feito com ❤️ por Plinio Mabesi
