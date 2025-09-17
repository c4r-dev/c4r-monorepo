import InitPrompt from "@/components/InitPrompt";

export default function Home() {
  return (
    <main className="bg-[#171819] text-white w-[761px] h-[689px] overflow-auto">
      <div className="flex justify-center min-h-[689px]">
        <div className="absolute left-0 w-[761px]">
          <InitPrompt />
        </div>
      </div>
    </main>
  )
}
