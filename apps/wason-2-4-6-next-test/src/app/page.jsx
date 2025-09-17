import dynamic from "next/dynamic";

const Tasks = dynamic(() => import("@/components/Tasks"));

export default async function HomePage() {

  return (
    <div>
      <Tasks />
    </div>
  );
} 