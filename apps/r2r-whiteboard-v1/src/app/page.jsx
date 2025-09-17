import dynamic from "next/dynamic";

const Tasks = dynamic(() => import("@/components/Tasks"));

export default async function HomePage() {

  return (
    <div>
      {/* <Tasks /> */}
      {/* <h1>Hello World</h1> */}
    </div>
  );
} 