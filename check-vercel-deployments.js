const fetch = require('node-fetch');

const API_TOKEN = 'WoeYyCc2yDFXVF9VZxLkubNV';
const PROJECT_ID = 'prj_WzqQxWcSj3JJokMrJPBZHBd9CQq5';
const TEAM_ID = 'team_PLos4jnPcJhOHdZZ5LOC8YjPyJg';

async function checkDeployments() {
  try {
    const response = await fetch(`https://api.vercel.com/v1/deployments?projectId=${PROJECT_ID}&teamId=${TEAM_ID}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Latest deployments:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDeployments();
