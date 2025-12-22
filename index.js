const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const port = process.env.PORT || 3000;

//from firebase code //
const admin = require("firebase-admin");

const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8')
const serviceAccount = JSON.parse(decoded);

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
    const reviewsCollection = db.collection('reviews');

    //???  middle wire with the database access for admin. Must be used after verifyFBToken middlewire  ???///
    const verifyAdmin = async(req,res,next) => {
        const email = req.decoded_email;
        const query = {email};
        const user = await usersCollection.findOne(query);

        if(!user || user?.role !== 'Admin'){
            return res.status(403).send({message: 'forbidden access'})
        }
        next();
    }

    const verifyModerator = async(req,res,next) => {
        const email = req.decoded_email;
        const query = {email};
        const user = await usersCollection.findOne(query);

        if(!user || user?.role !== 'Moderator'){
            return res.status(403).send({message: 'forbidden access'})
        }
        next();
    }

    /////// USERS API ///////
    app.post('/users',async(req,res) => {
      const user = req.body;
      user.role = 'Student';
      user.createdAt = new Date();

      const email = user.email;
      const userExists = await usersCollection.findOne({email});

      if(userExists){
        return res.send({message: 'User Already Exist!!'})
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    app.get('/users',async(req,res) => {
      const role = req.query.role;
      const query = role ? { role } : {};
      const result = await usersCollection.find(query).toArray();
      res.send(result)
    })

    // for role setup
    app.get('/users/:email/role', async(req,res)=> {
        const email = req.params.email;
        const query = {email};
        const user = await usersCollection.findOne(query);
        res.send({role: user?.role || 'Student'})
    })

    // for profile
    app.get('/user',async(req,res) => {
      const query = {};
      const {email} = req.query;
      if(email){
        query.email = email;
      }
      const result = await usersCollection.findOne(query);
      res.send(result)
    })

    // app.patch('/users/:id',verifyFBToken,async(req,res) => {
    app.patch('/users/:id/role',verifyFBToken,verifyAdmin,async(req,res) => {
      const id = req.params.id;
      // const data = req.body;
      const roleInfo = req.body;
      const query = {_id: new ObjectId(id)};
      // const updatedDoc ={
      //   $set : data
      // }
      const updatedDoc = {
          $set: {
              role : roleInfo.role
          }
      }
      const result = await usersCollection.updateOne(query,updatedDoc);
      res.send(result)
    })

    app.delete('/users/:id',verifyFBToken,async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await usersCollection.deleteOne(query);
      res.send(result)
    })

    /////// scholarships API ///////
    app.post('/scholarships',async(req,res) => {
        const scholarship = req.body;
        scholarship.createdAt = new Date();
        const result = await scholarshipsCollection.insertOne(scholarship);
        res.send(result);
    })

    app.get('/scholarships',async(req,res) => {
        const searchText = req.query.searchText;
        // const role = req.query.role;
        const country = req.query.country;
        const category = req.query.category;

        const query = {};
        if(searchText){
            // single class search
            // query.displayName = {$regex: searchText, $options: 'i'}

            // multiple class search
            query.$or = [
                // searching based on display name
                {scholarshipName : {$regex: searchText, $options: 'i'}},
                {universityName : {$regex: searchText, $options: 'i'}},
                {degree : {$regex: searchText, $options: 'i'}}
                // searching based on 
            ]
        }
        if(country){
          query.universityCountry = country;
        }
        if (category) {
          query.category = category;
        }

        const cursor = scholarshipsCollection.find(query).sort({createdAt: -1});
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

    app.get('/applications',async(req,res) => {
      const query = {};
      const {email} = req.query;
      if(email){
        query.userEmail = email;
      }
      const result = await applicationsCollection.find(query).toArray();
      res.send(result)
    })

    app.patch('/applications/:id',verifyFBToken,verifyModerator,async(req,res) => {
      const id = req.params.id;
      const data = req.body;
      const query = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: data
      }
      const result = await applicationsCollection.updateOne(query,updatedDoc)
      res.send(result);
    })

    app.delete('/applications/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await applicationsCollection.deleteOne(query);
      res.send(result)
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
      
      const query = {
        // scholarshipId: scholarship_id,
        // userEmail: user_email
         _id: new ObjectId(applicationId) 
      };
      const existingApp = await applicationsCollection.findOne(query);
      if (!existingApp) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (session.payment_status === 'paid') {
        const scholarship_id = session.metadata.scholarshipId;
        const user_email = session.customer_email;
        // const paidAt= new Date();
        // const existingApp = await applicationsCollection.findOne(query)

        const paidAtValue = existingApp.paidAt || new Date();

        
        const update = {
          $set: {
            paymentStatus: 'paid',
            applicationStatus: 'pending',
            transactionId : transactionId,
            ...(existingApp.paidAt ? {} : { paidAt: paidAtValue })
          }
        };

        const result = await applicationsCollection.updateOne(query, update);

        // if (result.matchedCount === 0) {
        //   return res.status(404).json({ message: "Application not found" });
        // }

        return res.json({success : true,modifyApplication: result,tracking_Id : trackingId,transaction_Id: transactionId,scholarshipName: scholarshipName,universityName: universityName,cost: cost,
          date: paidAtValue
        })
      }

      return res.status(400).json({ message: "Payment not completed" });
    });

    /////////// Reviews Api /////////
    app.post('/reviews',async(req,res) => {
        const reviews = req.body;
        // reviews.createdAt = new Date();
        const result = await reviewsCollection.insertOne(reviews);
        res.send(result);
    })

    app.get('/reviews',async(req,res) => {
      const query = {};
      const {email} = req.query;
      if(email){
        query.userEmail = email;
      }
      const result = await reviewsCollection.find(query).toArray();
      res.send(result)
    })

    app.patch('/reviews/:id',async(req,res) => {
      const id = req.params.id;
      const data = req.body;
      const query = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: data
      }
      const result = await reviewsCollection.updateOne(query,updatedDoc)
      res.send(result);
    })

    app.delete('/reviews/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await reviewsCollection.deleteOne(query);
      res.send(result)
    })

    // ======== Analytics API ========
    app.get('/admin/analytics', verifyFBToken, async (req, res) => {
      try {
        // Check admin role
        // if (req.user.role !== 'admin') {
        //   return res.status(403).json({ message: 'Forbidden: Admins only' });
        // }

        // Total Users
        const totalUsers = await db.collection('users').countDocuments();

        // Total Scholarships
        const totalScholarships = await db.collection('scholarships').countDocuments();

        // Total Fees Collected (only paid applications)
        const feesResult = await db.collection('applications').aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: "$applicationFees" } } }
        ]).toArray();
        const totalFeesCollected = feesResult[0]?.total || 0;

        // Applications by Category (Pie Chart)
        const applicationsByCategory = await db.collection('applications').aggregate([
          { $group: { _id: "$scholarshipCategory", count: { $sum: 1 } } },
          { $project: { _id: 0, category: "$_id", count: 1 } }
        ]).toArray();

        // Applications by University (Bar Chart)
        const applicationsByUniversity = await db.collection('applications').aggregate([
          { $group: { _id: "$universityName", count: { $sum: 1 } } },
          { $project: { _id: 0, university: "$_id", count: 1 } }
        ]).toArray();

        // Applications Growth Over Time (Line Chart)
        const applicationsOverTime = await db.collection('applications').aggregate([
          { $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id": 1 } },
          { $project: { _id: 0, date: "$_id", count: 1 } }
        ]).toArray();

        res.json({
          totalUsers,
          totalScholarships,
          totalFeesCollected,
          applicationsByCategory,
          applicationsByUniversity,
          applicationsOverTime
        });

      } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: "Failed to load analytics" });
      }
    });


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Scholar Stream is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
