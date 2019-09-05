;(async () => {
  // Set config using env vars
  require('dotenv').config();

  // Fire up a callback every 500ms to log memory usage
  let maxMemoryUsed = 0.0;
  const timeout = setInterval(() => {
    let currentMemoryUsed = process.memoryUsage().heapUsed / (1024 * 1024);
    maxMemoryUsed = Math.max(maxMemoryUsed, currentMemoryUsed);
    console.log(currentMemoryUsed);
  }, 500);

  const argv = require('minimist')(process.argv.slice(2));
  const { Pool } = require('pg');

  // Create pool(Why use pool? Refer https://node-postgres.com/features/pooling)
  const pool = new Pool();

  // Connect using a client from pool
  const client = await pool.connect();

  // Prevention against timeout
  console.log('\nDisabling statement_timeout...');
  await client.query(`SET statement_timeout TO 0`);
  console.log('Disabled statement_timeout.\n');

  const text = `
    SELECT * FROM ${argv.t}
  `;

  try {
    console.log('Querying...\n');

    const res = await client.query(text);

    console.log('\nSuccessfully queried!');
    console.log(`Total rows fetched: ${res.rows.length}`);
    console.log(`Max memory used during this run: ${maxMemoryUsed} MB`);
  } catch (e) {
    console.log('\nError occured while querying...');
    console.log(e.stack);
  } finally {
    // Release the client
    console.log('\nReturning client back to pool(releasing)...');
    client.release();
    console.log('Client released.\n');

    // Clear timeout
    clearTimeout(timeout);
  }
})().catch(e => console.log(e.stack));
