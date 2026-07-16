import mongoose from "mongoose";
import dns from "node:dns";

// Dynamically set public DNS servers to resolve MongoDB SRV records (fixes ECONNREFUSED/querySrv)
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (err) {
  console.warn("Failed to set custom DNS servers:", err);
}

if(!process.env.MONGODB_URL){
   console.log("Please provide MongoDb url")
}

export default async function dbConnect(){
 try {
    await mongoose.connect(process.env.MONGODB_URL!)
    console.log("DB Connected");
 } catch (error) {
    console.log("Error in db connection",error)
 }

}