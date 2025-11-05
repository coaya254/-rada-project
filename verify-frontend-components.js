// Script to verify all frontend UI components exist for politics/politician admin tools
const fs = require('fs');
const path = require('path');

// Map admin tool features to expected frontend components
const adminToolFeatures = {
  'Add Politician': {
    screen: 'CreatePoliticianScreen.tsx',
    description: 'Form to create new politician profile with 3-step wizard',
    required: true,
  },
  'Manage Politicians': {
    screen: 'ManagePoliticiansScreen.tsx',
    description: 'List and manage existing politicians with search, filter, bulk operations',
    required: true,
  },
  'Edit Politician': {
    screen: 'EditPoliticianScreen.tsx',
    description: 'Edit existing politician profile with content management links',
    required: true,
  },
  'Timeline Events': {
    screen: 'TimelineEventsScreen.tsx',
    description: 'Add and manage career milestones and timeline events',
    required: true,
  },
  'Track Commitments': {
    screen: 'CommitmentTrackingScreen.tsx',
    description: 'Manage promise tracking and commitment progress',
    required: true,
  },
  'Voting Records': {
    screen: 'VotingRecordsScreen.tsx',
    description: 'Import and manage parliamentary voting records',
    required: true,
  },
  'Documents': {
    screen: 'DocumentManagementScreen.tsx',
    description: 'Manage speeches, policies, and other documents',
    required: true,
  },
  'News Management': {
    screen: 'NewsManagementScreen.tsx',
    description: 'Manage news articles and link to politicians',
    required: true,
  },
  'Career Management': {
    screen: 'CareerManagementScreen.tsx',
    description: 'Manage education and career achievements',
    required: true,
  },
  'Analytics': {
    screen: 'AnalyticsScreen.tsx',
    description: 'Platform insights and metrics visualization',
    required: true,
  },
  'Reports': {
    screen: 'ReportsScreen.tsx',
    description: 'Generate and schedule detailed reports',
    required: true,
  },
  'Data Integrity': {
    screen: 'DataIntegrityScreen.tsx',
    description: 'System health checks and data validation',
    required: true,
  },
  'Politics Admin Dashboard': {
    screen: 'PoliticsAdminScreen.tsx',
    description: 'Main dashboard with overview stats and quick actions',
    required: true,
  },
  'Politician Selector': {
    screen: 'PoliticianSelectorScreen.tsx',
    description: 'Helper screen to select politician before navigating to specific tools',
    required: true,
  },
};

// Public-facing politician screens (for reference)
const publicScreens = {
  'Politician Profile': 'PoliticianProfileScreen.tsx',
  'Politician Detail': 'PoliticianDetailScreen.tsx',
  'Politicians List': 'PoliticiansScreen.tsx',
};

console.log('🔍 Verifying Frontend UI Components for Politics/Politician Admin Tools\n');
console.log('='.repeat(100));

const basePath = path.join(__dirname, 'RadaAppClean', 'src', 'screens');
const adminPath = path.join(basePath, 'admin');
const politicsPath = path.join(basePath, 'politics');

console.log(`\n📂 Base Paths:`);
console.log(`   Admin screens:    ${adminPath}`);
console.log(`   Politics screens: ${politicsPath}\n`);

console.log('='.repeat(100));
console.log('\n📊 Admin Tool Features & Their UI Components:\n');

let totalFeatures = 0;
let existingComponents = 0;
let missingComponents = [];

for (const [feature, details] of Object.entries(adminToolFeatures)) {
  totalFeatures++;
  const screenPath = path.join(adminPath, details.screen);
  const exists = fs.existsSync(screenPath);

  if (exists) {
    existingComponents++;
    console.log(`✅ ${feature}`);
    console.log(`   Screen: ${details.screen}`);
    console.log(`   Description: ${details.description}`);

    // Get file stats for additional info
    const stats = fs.statSync(screenPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   File size: ${sizeKB} KB`);

    // Read file to check for key features
    const content = fs.readFileSync(screenPath, 'utf8');
    const hasUseState = content.includes('useState');
    const hasUseEffect = content.includes('useEffect');
    const hasAdminAPI = content.includes('adminAPI') || content.includes('AdminAPIService');
    const hasNavigation = content.includes('navigation');

    const features = [];
    if (hasUseState) features.push('State Management');
    if (hasUseEffect) features.push('Effects');
    if (hasAdminAPI) features.push('API Integration');
    if (hasNavigation) features.push('Navigation');

    if (features.length > 0) {
      console.log(`   Features: ${features.join(', ')}`);
    }
  } else {
    missingComponents.push({ feature, screen: details.screen });
    console.log(`❌ ${feature}`);
    console.log(`   Screen: ${details.screen} - MISSING`);
    console.log(`   Description: ${details.description}`);
  }
  console.log('');
}

console.log('='.repeat(100));
console.log('\n📈 Summary:\n');
console.log(`   Total admin features: ${totalFeatures}`);
console.log(`   Existing components: ${existingComponents}/${totalFeatures}`);
console.log(`   Missing components: ${missingComponents.length}/${totalFeatures}\n`);

if (missingComponents.length > 0) {
  console.log('⚠️  Missing Components:');
  missingComponents.forEach(({ feature, screen }) => {
    console.log(`   - ${feature}: ${screen}`);
  });
  console.log('');
}

// Check public-facing screens
console.log('='.repeat(100));
console.log('\n📱 Public-Facing Politician Screens:\n');

for (const [screenName, fileName] of Object.entries(publicScreens)) {
  const screenPath = path.join(politicsPath, fileName);
  const exists = fs.existsSync(screenPath);

  if (exists) {
    const stats = fs.statSync(screenPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ ${screenName.padEnd(30)} - ${fileName} (${sizeKB} KB)`);
  } else {
    console.log(`❌ ${screenName.padEnd(30)} - ${fileName} - MISSING`);
  }
}

// Check navigation configuration
console.log('\n' + '='.repeat(100));
console.log('\n🧭 Checking Navigation Configuration:\n');

const navigationPaths = [
  'RadaAppClean/src/navigation/AdminStackNavigator.tsx',
  'RadaAppClean/src/navigation/PoliticsStackNavigator.tsx',
  'RadaAppClean/src/navigation/AppNavigator.tsx',
];

for (const navPath of navigationPaths) {
  const fullPath = path.join(__dirname, navPath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ ${path.basename(navPath).padEnd(40)} (${sizeKB} KB)`);

    // Check if it includes our admin screens
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasManagePoliticians = content.includes('ManagePoliticians');
    const hasCreatePolitician = content.includes('CreatePolitician');
    const hasEditPolitician = content.includes('EditPolitician');
    const hasTimelineEvents = content.includes('TimelineEvents');
    const hasCommitmentTracking = content.includes('CommitmentTracking');

    if (hasManagePoliticians || hasCreatePolitician || hasEditPolitician || hasTimelineEvents || hasCommitmentTracking) {
      console.log(`   ✓ Contains politician admin routes`);
    }
  } else {
    console.log(`❌ ${path.basename(navPath)} - MISSING`);
  }
}

console.log('\n' + '='.repeat(100));
console.log('\n✅ Frontend component verification complete!\n');

if (existingComponents === totalFeatures) {
  console.log('🎉 All required admin UI components exist!\n');
} else {
  console.log(`⚠️  ${missingComponents.length} component(s) need to be created.\n`);
}

console.log('📝 Next steps:');
console.log('   1. Create any missing UI components');
console.log('   2. Verify navigation routes include all screens');
console.log('   3. Test UI flows from admin dashboard to each feature');
console.log('   4. Ensure API integration works in each component\n');
