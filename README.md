# CADRIMIL APP

![Cadrimil Logo](./assets/logo_header.png)

**Cadrimil** é um aplicativo móvel desenvolvido com React Native e Expo para auxiliar militares no cálculo de diárias de viagem. O aplicativo permite simular valores a receber com base no posto/graduação, localidade e período da missão, além de fornecer acesso rápido às tabelas de valores e legislação vigente.

## 📱 Funcionalidades

- **Calculadora de Diárias**: Simule valores inserindo múltiplos trechos e localidades.
- **Gerenciamento de Missões**: Salve, edite e exclua seus cálculos para consulta futura.
- **Tabelas de Valores**: Consulte valores atualizados de diárias e Adicional de Embarque/Desembarque (AED).
- **Legislação**: Acesso rápido aos decretos que regulamentam as indenizações.
- **Relatórios em PDF**: Gere e compartilhe o detalhamento dos cálculos em formato PDF.
- **Interface Moderna**: Design profissional e minimalista com suporte a tema escuro/gradiente.
- **Ajuda e Suporte**: Guia passo a passo integrado e opção de doação.

## 🛠️ Tecnologias

- **React Native** (0.81.5) - Framework mobile
- **Expo** (~54.0.25) - Plataforma de desenvolvimento
- **TypeScript** (~5.9.2) - Desenvolvimento tipado
- **React Navigation** (^7.0.0) - Navegação (Stack e Tabs)
- **AsyncStorage** (^2.2.0) - Persistência de dados local
- **Expo Print & Sharing** - Geração e compartilhamento de PDF
- **Expo Linear Gradient** - Estilização visual

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- Expo CLI
- Dispositivo Android/iOS com Expo Go ou Emulador

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/mabesi/cadrimil.git
cd cadrimil
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm start
```

4. **Execute no seu dispositivo**
   - Escaneie o QR code com o app Expo Go (Android/iOS)
   - Ou execute no emulador:
     ```bash
     npm run android  # Para Android
     npm run ios      # Para iOS
     ```

## 📦 Build para Produção

### Android APK (Preview)
```bash
eas build --platform android --profile preview
```

### Build de Produção
```bash
eas build --platform android --profile production
```

## � Estrutura do App

```
cadrimil/
├── src/
│   ├── components/       # Componentes reutilizáveis (Header, Buttons, Cards)
│   ├── constants/        # Cores, estilos globais e dados estáticos
│   ├── context/          # Gerenciamento de estado (MissionContext)
│   ├── navigation/       # Configuração de rotas (Stack e Tabs)
│   ├── screens/          # Telas do aplicativo (Calculator, Missions, Help, etc.)
│   ├── services/         # Serviços (Storage, API)
│   ├── types/            # Definições de tipos TypeScript
│   └── utils/            # Funções utilitárias (Cálculos, Formatação, PDF)
├── assets/               # Imagens e ícones
└── App.tsx               # Ponto de entrada da aplicação
```

## � Licença

Este projeto está licenciado sob a [MIT License](https://opensource.org/license/MIT).

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
