const https = require('https');

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN non défini');
  process.exit(1);
}

const options = {
  hostname: 'api.hubapi.com',
  path: '/oauth/v1/access-tokens/' + HUBSPOT_TOKEN,
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + HUBSPOT_TOKEN
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('\n✅ Permissions actuelles du token:');
      console.log('=====================================');
      if (result.scopes) {
        result.scopes.forEach(scope => {
          console.log(`  ✓ ${scope}`);
        });
      } else {
        console.log('Réponse:', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.error('❌ Erreur parsing:', e.message);
      console.log('Réponse brute:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur requête:', e.message);
});

req.end();
