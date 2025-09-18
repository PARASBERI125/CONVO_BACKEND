import mongoose from "mongoose";

const connectDb = async (url) => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully to database");

 setInterval(async ()=>{
    try{
     await mongoose.connection.db.admin().command({ping:1});
      console.log("Pinged MongoDB to keep it awake");
   }catch(err){
     console.log("MongoDB ping failed",err);
   }
 } , 14*60*1000 );
    
  } catch (error) {
    console.log("Error connecting the database", error);
  }
};
export default connectDb;
