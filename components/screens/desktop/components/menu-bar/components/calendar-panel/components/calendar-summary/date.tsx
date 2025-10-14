import Counter from "@/components/ui/counter";

export default function DateWidget({
  dayLabel,
  dayNumber,
  monthLabel,
}: {
  dayLabel: string;
  dayNumber: number;
  monthLabel: string;
}) {
  return (
    <div className="bg-[#F4F4F4] rounded-4xl px-6 py-4 flex flex-col items-center shadow-xl">
      <p className="capitalize gap-1 flex font-bold items-center text-2xl">
        <span className="text-rose-500">{dayLabel.slice(0, 3)}</span>
        <span className="text-gray-500">{monthLabel.slice(0, 3)}</span>
      </p>

      <Counter
        value={dayNumber}
        places={[10, 1]}
        textColor="black"
        fontSize={96}
        gap={0}
        digitStyle={{
          width: 42,
          textAlign: "center",
          fontWeight: 600,
          lineHeight: 1,
          marginTop: -6,
        }}
      />
    </div>
  );
}
