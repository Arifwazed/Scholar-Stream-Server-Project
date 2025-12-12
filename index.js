const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const port = process.env.PORT || 3000;

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gafegcj.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db('scholar_stream_db');
    const usersCollection = db.collection('users');
    const scholarshipsCollection = db.collection('scholarships');

    /////// USERS API ///////
    /////// scholarships API ///////
    app.post('/scholarships',async(req,res) => {
        const scholarship = req.body;
        scholarship.createdAt = new Date();
        const result = await scholarshipsCollection.insertOne(scholarship);
        res.send(result);
    })

    app.get('/scholarships',async(req,res) => {
        const query = {}
        const cursor = scholarshipsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/scholarships/:id', async(req,res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await scholarshipsCollection.findOne(query);
      res.send(result)
    })

    app.delete('/scholarships/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await scholarshipsCollection.deleteOne(query);
      res.send(result)
    })

    app.patch('/scholarships/:id', async(req,res) => {
      const id = req.params.id;
      const data = req.body;
      const query = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: data
      }
      const result = await scholarshipsCollection.updateOne(query,updatedDoc)
      res.send(result);
    })

    /////////// Payment Api /////////
    app.post('/create-checkout-session', async (req, res) => {
      const paymentInfo = req.body;
      const amount = parseInt(paymentInfo.cost) * 100;
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, price_1234) of the product you want to sell
            price_data: {
              currency: 'USD',
              unit_amount: amount,
              product_data: {
                name: paymentInfo.scholarshipName
              }
            },
            quantity: 1,
          },
        ],
        customer_email: paymentInfo.userEmail,
        mode: 'payment',
        metadata: {
          scholarshipId: paymentInfo.scholarshipId,
        },
        success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success`,
        cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancelled`,
      });
      console.log(session)
      res.send({url: session.url})
      // res.redirect(303, session.url);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
