#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEmails() {
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('\n📧 Email Logs (Last 10)');
  console.log('═'.repeat(70));

  if (data.length === 0) {
    console.log('No emails sent yet');
  } else {
    data.forEach(email => {
      console.log(`\nType:       ${email.email_type}`);
      console.log(`To:         ${email.recipient}`);
      console.log(`Status:     ${email.status.toUpperCase()}`);
      console.log(`Sent:       ${new Date(email.sent_at).toLocaleString()}`);
      console.log(`Inv ID:     ${email.investigation_id}`);
      console.log('-'.repeat(70));
    });
  }

  console.log('═'.repeat(70) + '\n');
}

checkEmails();
