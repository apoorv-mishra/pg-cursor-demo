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
  const util = require('util');
  const { Pool } = require('pg');
  const Cursor = require('pg-cursor');

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

  const ROWS_PER_BATCH = argv.r || 1000;

  try {
    const cursor = client.query(new Cursor(text));

    // Promisify cursor.read to make it compatible with async/await
    const promisifiedCursorRead = util.promisify(cursor.read.bind(cursor));

    console.log('Querying...\n');

    let totalRowsFetched = 0;
    let rows;
    do {
      rows = await promisifiedCursorRead(ROWS_PER_BATCH);
      totalRowsFetched += rows.length;
    } while(rows.length);

    console.log('\nSuccessfully queried!');
    console.log(`Total rows fetched: ${totalRowsFetched}`);
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

