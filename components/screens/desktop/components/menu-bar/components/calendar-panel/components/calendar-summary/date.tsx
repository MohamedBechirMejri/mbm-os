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
    <div className="bg-[#F4F4F4] rounded-4xl px-8 py-4 flex flex-col items-center shadow-xl">
      <p className="capitalize gap-1 flex font-bold items-center text-2xl">
        <span className="text-rose-500">{dayLabel.slice(0, 3)}</span>
        <span className="text-gray-500">{monthLabel.slice(0, 3)}</span>
      </p>
      <h1 className="text-8xl leading-none font-semibold -mt-1">{dayNumber}</h1>
    </div>
  );
}
