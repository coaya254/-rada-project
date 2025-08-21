# Rada.ke Mobile App

A comprehensive React Native mobile application for civic engagement and government accountability in Kenya. This app empowers citizens to track government promises, share evidence, learn about civic rights, and build community recognition.

## 🚀 Features

### 🏠 **Home Dashboard**
- **Featured Content**: Top stories and trending civic actions
- **Quick Actions**: Daily civic engagement tasks with XP rewards
- **Weekly Challenges**: Gamified accountability challenges
- **Honor Wall Preview**: Community recognition highlights
- **User Stats**: XP points, day streaks, and achievement tracking

### 🏛️ **Honor Wall**
- **Community Recognition**: Celebrate local heroes and activists
- **Category Filtering**: Education, Environment, Health, Community
- **Verified Badges**: Authenticated community members
- **Support System**: Vote and support community initiatives
- **XP Rewards**: Earn points for community engagement

### 📊 **Promise Tracker**
- **Government Accountability**: Track government promises and progress
- **Evidence Submission**: Submit photos and documentation
- **Progress Visualization**: Real-time progress bars and statistics
- **Filter Options**: Active, Completed, Overdue promises
- **Priority Levels**: Critical, High, Medium, Low priority tracking

### 📚 **Learning Hub**
- **Civic Education**: Interactive learning modules
- **Quiz System**: Knowledge testing with XP rewards
- **Progress Tracking**: Lesson completion and achievement badges
- **Categories**: Government, Rights, Budget, Security
- **Difficulty Levels**: Beginner to Advanced content

### 👤 **Profile & Settings**
- **User Statistics**: Comprehensive activity tracking
- **Achievement System**: Unlockable badges and milestones
- **Privacy Controls**: Anonymous mode and privacy settings
- **App Preferences**: Notifications, dark mode, and customization
- **Community Stats**: Supporters, honors given, and engagement metrics

## 🛠️ Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Styling**: React Native StyleSheet with Linear Gradients
- **State Management**: React Hooks (useState, useContext)
- **Storage**: AsyncStorage for local data persistence
- **Icons**: React Native Vector Icons
- **UI Components**: Custom components with modern design

## 📱 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Quick Start

1. **Clone the repository**
```bash
   git clone <repository-url>
cd rada-mobile/RadaMobile
   ```

2. **Install dependencies**
   ```bash
npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
npm start
   # or
   expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 📁 Project Structure

```
src/
├── screens/
│   ├── MainApp.tsx          # Main app with tab navigation
│   ├── HonorWall.tsx        # Community recognition screen
│   ├── PromiseTracker.tsx   # Government promise tracking
│   ├── LearningHub.tsx      # Civic education modules
│   ├── ProfileScreen.tsx    # User profile and settings
│   ├── OnboardingFlow.tsx   # User onboarding
│   └── AnonModeSetup.tsx    # Anonymous mode configuration
├── contexts/
│   └── UserContext.tsx      # Global user state management
├── components/              # Reusable UI components
├── utils/                   # Helper functions and utilities
└── types/                   # TypeScript type definitions
```

## 🎨 Design System

### Color Palette
- **Primary**: `#667eea` (Purple Blue)
- **Secondary**: `#764ba2` (Deep Purple)
- **Accent**: `#FFD700` (Gold)
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FF9800` (Orange)
- **Error**: `#FF5722` (Red)
- **Background**: `#f5f5f7` (Light Gray)

### Typography
- **Headers**: Bold, 24-28px
- **Body Text**: Regular, 14-16px
- **Captions**: Light, 12px
- **Buttons**: Semi-bold, 14-16px

### Components
- **Cards**: Rounded corners (12-16px), subtle shadows
- **Buttons**: Gradient backgrounds, rounded corners
- **Navigation**: Bottom tabs with active states
- **Progress Bars**: Animated, color-coded progress indicators

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
API_BASE_URL=your_api_endpoint
EXPO_PUBLIC_APP_NAME=Rada.ke
```

### App Configuration
- **App Name**: Rada.ke
- **Version**: 1.0.0
- **Platform**: iOS & Android
- **Minimum SDK**: iOS 13.0, Android API 21

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for both platforms
expo build
```

### App Store Deployment
1. Configure app.json with store details
2. Build production version
3. Submit to App Store Connect / Google Play Console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Community**: Kenyan civic activists and community organizers
- **Design Inspiration**: Modern mobile app design patterns
- **Open Source**: React Native and Expo communities

## 📞 Support

For support and questions:
- **Email**: support@rada.ke
- **Documentation**: [docs.rada.ke](https://docs.rada.ke)
- **Community**: [community.rada.ke](https://community.rada.ke)

---

**Built with ❤️ for Kenya's civic engagement**
