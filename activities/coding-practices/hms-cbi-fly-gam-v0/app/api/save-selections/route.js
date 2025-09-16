import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { studyId, title, description, narative, obstacles, selections } = body;

    const client = await clientPromise;
    const db = client.db("c4r"); // Replace with your database name
    const collection = db.collection("flyinggame"); // Replace with your collection name

    const result = await collection.insertOne({
      studyId,
      title,
      description,
      narative,
      obstacles,
      selections,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ message: "Selections saved", result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving selections:", error);
    return new Response(JSON.stringify({ message: "Error saving selections", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
