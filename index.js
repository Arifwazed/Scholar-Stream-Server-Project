const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const port = process.env.PORT || 3000;

//from firebase code //
const admin = require("firebase-admin");
const serviceAccount = require('./scholar-stream-projects-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// middleware
app.use(cors())
app.use(express.json())

const verifyFBToken =async (req,res,next) => {
    const token = req.headers.authorization;
    console.log('headers in the middlewire',token);
    if(!token){
        return res.status(401).send({message: 'unauthorized access'})
    }
    try{
        const idToken = token.split(' ')[1];
        const decoded = await admin.auth().verifyIdToken(idToken);
        console.log('decoded in the token:',decoded);
        req.decoded_email = decoded.email;
        next();

    }
    catch(error){
        res.status(401).send({message: 'unauthorized access'})
    }
}

// tracking Id for application
function generateTrackingId() {
  const prefix = "SS"; // or your company code
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // random chars
  
  return `${prefix}-${datePart}-${randomPart}`;
}

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
    const applicationsCollection = db.collection('applications');

    /////// USERS API ///////
    app.post('/users',async(req,res) => {
      const user = req.body;
      user.role = 'user';
      user.createdAt = new Date();

      const email = user.email;
      const userExists = await usersCollection.findOne({email});

      if(userExists){
        return res.send({message: 'User Already Exist!!'})
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    /////// scholarships API ///////
    app.post('/scholarships',async(req,res) => {
        const scholarship = req.body;
        scholarship.createdAt = new Date();
        const result = await scholarshipsCollection.insertOne(scholarship);
        res.send(result);
    })

    app.get('/scholarships',verifyFBToken,async(req,res) => {
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

    /////// APPLICATION API /////////
    app.post('/applications', async(req,res) => {
      const application = req.body;
      application.createdAt = new Date();
      application.applicationStatus = 'draft';
      application.paymentStatus = 'unpaid';
      const trackingId = generateTrackingId();
      application.trackingId = trackingId;
      const result = await applicationsCollection.insertOne(application);
      res.send({insertedId: result.insertedId,trackingId:trackingId})
    })

    /////////// Payment Api /////////
    // for payment using stripe
    app.post('/create-checkout-session', async (req, res) => {
      const paymentInfo = req.body;
      console.log("Payment Info:",paymentInfo);
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
          scholarshipName: paymentInfo.scholarshipName,
          universityName : paymentInfo.universityName,
          trackingId: paymentInfo.trackingId,
          applicationId: paymentInfo.applicationId,
          cost: paymentInfo.cost,
        },
        success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancelled`,
      });
      console.log(session)
      res.send({url: session.url})
      // res.redirect(303, session.url);
    });

    // for successful payment
    app.patch('/payment-success', async (req, res) => {
      const sessionId = req.query.session_id;
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      console.log("PAYMENT STATUS:", session);
      // console.log("METADATA:", session.metadata);
      const transactionId = session.payment_intent;
      const trackingId = session.metadata.trackingId;
      const applicationId = session.metadata.applicationId;
      const scholarshipName = session.metadata.scholarshipName;
      const universityName = session.metadata.universityName;
      const cost = session.metadata.cost;
      

      if (session.payment_status === 'paid') {
        const scholarship_id = session.metadata.scholarshipId;
        const user_email = session.customer_email;
        // const paidAt= new Date();

        const query = {
          // scholarshipId: scholarship_id,
          // userEmail: user_email
           _id: new ObjectId(applicationId) 
        };

        const update = {
          $set: {
            paymentStatus: 'paid',
            applicationStatus: 'pending',
            transactionId : transactionId,
            paidAt: paidAt
          }
        };

        const result = await applicationsCollection.updateOne(query, update);

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Application not found" });
        }

        res.json({success : true,modifyApplication: result,tracking_Id : trackingId,transaction_Id: transactionId,scholarshipName: scholarshipName,universityName: universityName,cost: cost,date: paidAt})
      }

      return res.status(400).json({ message: "Payment not completed" });
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
