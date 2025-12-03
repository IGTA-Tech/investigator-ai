#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkInvestigation() {
  const investigationId = process.argv[2];

  if (!investigationId) {
    console.log('Usage: node check-investigation.js <investigation-id>');
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('investigations')
    .select('*')
    .eq('id', investigationId)
    .single();

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('\n📊 Investigation Status');
  console.log('═'.repeat(50));
  console.log(`ID:                ${data.id}`);
  console.log(`Target:            ${data.target_name}`);
  console.log(`URL:               ${data.target_url || 'N/A'}`);
  console.log(`Status:            ${data.status.toUpperCase()}`);
  console.log(`Created:           ${new Date(data.created_at).toLocaleString()}`);
  console.log(`Updated:           ${new Date(data.updated_at).toLocaleString()}`);

  if (data.status === 'completed') {
    console.log(`\nCompleted:         ${new Date(data.completed_at).toLocaleString()}`);
    console.log(`Legitimacy Score:  ${data.legitimacy_score}/10`);
    console.log(`Recommendation:    ${data.recommendation}`);
    console.log(`Confidence:        ${(data.confidence_level * 100).toFixed(0)}%`);
    console.log(`\nReport URL:        ${data.report_url || 'Not generated'}`);
  } else if (data.status === 'failed') {
    console.log('\n❌ Investigation failed');
  } else if (data.status === 'processing') {
    console.log('\n⏳ Investigation in progress...');
  } else {
    console.log('\n⏸️  Investigation pending');
  }

  console.log('═'.repeat(50) + '\n');
}

checkInvestigation();
