const {MongoClient} = require('mongodb');

let connection;
let db;
const dbName = 'sponge-bob'
const url = 'mongodb://127.0.0.1:27017'

beforeAll(async () => {
  connection = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db = await connection.db(dbName);
});


afterAll(async () => {
  await connection.close();
});

it('should aggregate docs from collection', async () => {
  const files = db.collection('files');

  await files.insertMany([
    {type: 'Document'},
    {type: 'Video'},
    {type: 'Image'},
    {type: 'Document'},
    {type: 'Image'},
    {type: 'Document'},
  ]);

  const topFiles = await files
    .aggregate([
      {$group: {_id: '$type', count: {$sum: 1}}},
      {$sort: {count: -1}},
    ])
    .toArray();

  expect(topFiles).toEqual([
    {_id: 'Document', count: 3},
    {_id: 'Image', count: 2},
    {_id: 'Video', count: 1},
  ]);
});

afterEach(async () => {
  try {
    const files = db.collection('files');
    await files.deleteMany({})
  } catch (err) {
    console.log(err)
  }
})
