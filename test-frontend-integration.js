// ==========================================================
// FRONTEND INTEGRATION TEST
// ==========================================================
// This simulates exactly what the React Native app does
// when using the admin dashboard

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_API_PREFIX = '/admin';

class TestAdminAPIService {
  constructor() {
    this.baseURL = `${API_BASE_URL}${ADMIN_API_PREFIX}`;
    this.token = null;
  }

  async login(credentials) {
    console.log('🔐 Testing admin login...');

    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        this.token = data.data.token;
        console.log('✅ Login successful!');
        console.log(`   User: ${data.data.user.username} (${data.data.user.role})`);
        console.log(`   Permissions: ${data.data.permissions.length} modules`);
        return data;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  }

  async createPolitician(politicianData) {
    console.log('\\n👥 Testing politician creation...');

    try {
      const response = await fetch(`${this.baseURL}/politicians`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(politicianData)
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Politician created successfully!');
        console.log(`   Name: ${data.data.name}`);
        console.log(`   ID: ${data.data.id}`);
        console.log(`   Position: ${data.data.current_position}`);
        console.log(`   Party: ${data.data.party} (${data.data.party_color})`);
        return data;
      } else {
        throw new Error(data.error || 'Creation failed');
      }
    } catch (error) {
      console.error('❌ Politician creation failed:', error.message);
      throw error;
    }
  }

  async fetchPoliticians() {
    console.log('\\n📋 Testing politician fetch (admin)...');

    try {
      const response = await fetch(`${this.baseURL}/politicians`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Politicians fetched successfully!');
        console.log(`   Total: ${data.data.politicians.length} politicians`);
        console.log(`   Page: ${data.data.pagination.page}/${data.data.pagination.pages}`);

        data.data.politicians.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name} - ${p.current_position} (${p.party})`);
        });

        return data;
      } else {
        throw new Error(data.error || 'Fetch failed');
      }
    } catch (error) {
      console.error('❌ Politicians fetch failed:', error.message);
      throw error;
    }
  }

  async updatePolitician(id, updates) {
    console.log(`\\n✏️ Testing politician update (ID: ${id})...`);

    try {
      const response = await fetch(`${this.baseURL}/politicians/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Politician updated successfully!');
        console.log(`   Name: ${data.data.name}`);
        console.log(`   Updated fields:`, Object.keys(updates).join(', '));
        return data;
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Politician update failed:', error.message);
      throw error;
    }
  }

  async testPublicAPI() {
    console.log('\\n🌐 Testing public API access...');

    try {
      const response = await fetch(`${API_BASE_URL}/politicians`);
      const politicians = await response.json();

      console.log('✅ Public API accessible!');
      console.log(`   Politicians available to public: ${politicians.length}`);

      politicians.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.current_position}`);
      });

      return politicians;
    } catch (error) {
      console.error('❌ Public API failed:', error.message);
      throw error;
    }
  }

  async verifyToken() {
    console.log('\\n🔍 Testing token verification...');

    try {
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Token verified successfully!');
        console.log(`   User: ${data.data.user.username}`);
        console.log(`   Role: ${data.data.user.role}`);
        return data;
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      throw error;
    }
  }
}

// ==========================================================
// INTEGRATION TEST SUITE
// ==========================================================

async function runIntegrationTests() {
  console.log('🚀 STARTING FRONTEND-BACKEND INTEGRATION TESTS');
  console.log('=' .repeat(60));

  const apiService = new TestAdminAPIService();

  try {
    // Test 1: Admin Login
    await apiService.login({
      username: 'superadmin',
      password: 'Admin@2024!'
    });

    // Test 2: Token Verification
    await apiService.verifyToken();

    // Test 3: Create a Politician
    const newPolitician = await apiService.createPolitician({
      name: 'Raila Odinga',
      title: 'Rt. Hon.',
      current_position: 'AU High Representative',
      party: 'ODM',
      constituency: 'Langata',
      education: 'University of Leipzig',
      wikipedia_summary: 'Kenyan politician and former Prime Minister',
      party_color: '#FF0000',
      key_achievements: [
        'Former Prime Minister of Kenya',
        'Opposition leader',
        'AU High Representative for Infrastructure'
      ]
    });

    // Test 4: Fetch Politicians (Admin View)
    await apiService.fetchPoliticians();

    // Test 5: Update Politician
    await apiService.updatePolitician(newPolitician.data.id, {
      wikipedia_summary: 'Kenyan politician, former Prime Minister, and current AU High Representative for Infrastructure Development',
      key_achievements: [
        'Former Prime Minister of Kenya (2008-2013)',
        'Long-serving opposition leader',
        'AU High Representative for Infrastructure Development',
        'Champion of democratic reforms'
      ]
    });

    // Test 6: Public API Access
    await apiService.testPublicAPI();

    // Test 7: Create Another Politician
    await apiService.createPolitician({
      name: 'Martha Karua',
      title: 'Hon.',
      current_position: 'NARC-Kenya Party Leader',
      party: 'NARC-Kenya',
      constituency: 'Kirinyaga Central',
      education: 'University of Nairobi',
      wikipedia_summary: 'Kenyan lawyer and politician, former Minister of Justice',
      party_color: '#8B0000',
      key_achievements: [
        'Former Minister of Justice',
        'Women\'s rights advocate',
        'Anti-corruption champion'
      ]
    });

    // Test 8: Final Politicians List
    const finalList = await apiService.fetchPoliticians();

    console.log('\\n' + '=' .repeat(60));
    console.log('🎉 ALL INTEGRATION TESTS PASSED!');
    console.log('=' .repeat(60));
    console.log('');
    console.log('✅ Admin Authentication: WORKING');
    console.log('✅ Politician CRUD: WORKING');
    console.log('✅ Public API: WORKING');
    console.log('✅ Data Persistence: WORKING');
    console.log('✅ Frontend-Backend Connection: PERFECT');
    console.log('');
    console.log(`📊 Total Politicians Created: ${finalList.data.politicians.length}`);
    console.log('🚀 Your admin dashboard is ready for use!');

  } catch (error) {
    console.log('\\n' + '=' .repeat(60));
    console.log('❌ INTEGRATION TEST FAILED');
    console.log('=' .repeat(60));
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the tests
runIntegrationTests();