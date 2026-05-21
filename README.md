# Wakeel AI - Frontend 📱

This is the frontend mobile application for Wakeel AI, an intelligent legal assistant. Built with React Native and Expo, it provides a seamless cross-platform experience for users to interact with AI-powered legal services.

## 🚀 Technologies Used
- **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
- **Navigation**: React Navigation (Native Stack, Bottom Tabs)
- **Styling**: Custom Theme (`Theme.ts`) with Glassmorphism components (`GlassCard`)
- **Icons**: Lucide React Native
- **State Management**: React Context (`AuthContext`, `LanguageContext`)
- **Storage**: AsyncStorage
- **Internationalization (i18n)**: Multi-language support (English `en.json`, Urdu `ur.json`)

## 📁 Project Structure

```text
src/
├── components/   # Reusable UI components (CustomButton, GlassCard)
├── constants/    # App-wide constants and Theme definitions
├── hooks/        # Custom React hooks (e.g., useTasks)
├── locales/      # Localization dictionaries (English, Urdu)
├── navigation/   # Routing configuration (AppNavigator)
├── screens/      # Application screens (Home, Chat, Cases, Auth, Profile)
├── services/     # API integration and external services
└── store/        # Global state contexts (Auth, Language)
```

## 🧩 Key Features & Screens

- **Authentication Flow**: Secure Login (`LoginScreen`), Registration (`RegisterScreen`), and Welcome onboarding (`WelcomeScreen`).
- **Home Dashboard**: Overview of recent activity and quick access to legal tools (`HomeScreen`).
- **AI Chat Interface**: Real-time legal consultation and document generation via AI (`ChatScreen`). Integrates with Whisper API for voice capabilities.
- **Case Management**: View and track legal cases and document drafts (`CasesScreen`).
- **User Profile**: Manage account settings, language preferences, and view app information (`ProfileScreen`).
- **Legal & About**: Dedicated screens for Terms of Service, Privacy Policy, and About information.

## 🔌 API & Services

The application communicates with the FastAPI backend using structured service modules located in `src/services`:
- `api.ts`: Core Axios instance configuration with base URL and interceptors.
- `authService.ts`: Handles user authentication, token management, and profile retrieval.
- `caseService.ts`: Manages case data fetching, activity tracking, and statistics.
- `legalService.ts`: Interfaces with the AI for legal advice and document generation.
- `whisperApi.ts`: Handles audio transcription services.

The backend base URL is configured directly in `app.json` under the `extra.apiBaseUrl` object.

## 🛠️ Setup and Installation

### Prerequisites
- Node.js (v18 or newer recommended)
- Expo CLI
- Expo Go app installed on your mobile device (or Android Studio/Xcode for simulators)

### Installation Steps

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm run start:expo
# or
npx expo start
```

3. Open the app:
- **Physical Device**: Scan the QR code shown in the terminal using the Expo Go app.
- **Simulator**: Press `a` for Android or `i` for iOS in the terminal.

### Building the APK
The application is configured to build standalone Android APKs via Expo Application Services (EAS).
```bash
eas build -p android --profile preview
```