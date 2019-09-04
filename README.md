![](http://i.imgur.com/z2Jjmuj.gif)

# pg-cursor-demo
Compare memory footprints with and without pg-cursor.

### Note
Please run following benchmarks in your dev environment(e.g, Postgres running on localhost), running against prod is strictly **PROHIBITED**.
### Usage
1. Login to your psql server using `psql -h <host> -U <user> -d <database>` and run,
```
CREATE TABLE big_table (id INTEGER);
INSERT INTO big_table(id) SELECT g.id FROM generate_series(1, 20000000) AS g (id);
```
2. `git clone https://github.com/apoorv-mishra/pg-cursor-demo.git`
3. `cd pg-cursor-demo`
4. Create a `.env` file with the following config :-
```
PGUSER=<user>
PGPASSWORD=<password>
PGHOST=<host>
PGDATABASE=<database>
PGPORT=<port>
```
5. `npm install`
6. Split the terminal vertically, run `node without-cursor.js -t bit_table` in one and `node with-cursor.js -t big_table` in the other simultaneously.
7. Sit back and observe the numbers(those numbers are just `heapUsed` in `MBs`).
