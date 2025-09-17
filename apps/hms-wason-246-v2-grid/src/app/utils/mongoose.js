import { connect, connection } from "mongoose";

const conn = {
  isConnected: false,
};

export async function dbConnect() {
  if (conn.isConnected) {
    return;
  }

  const url = process.env.MONGO_URL
  const db = await connect(url)
  
  conn.isConnected = db.connections[0].readyState;
}

connection.on("connected", () => console.log("Mongodb connected to db"));

connection.on("error", (err) => console.error("Mongodb Errro:", err.message));
