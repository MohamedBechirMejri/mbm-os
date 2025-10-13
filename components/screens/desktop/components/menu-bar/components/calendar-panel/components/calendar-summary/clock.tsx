export default function ClockWidget({
  formattedTime,
  timeZone,
}: {
  formattedTime: string;
  timeZone: string;
}) {
  return (
    <div className="flex flex-col items-end gap-3 bg-[#F4F4F4] w-full h-full p-4 rounded-4xl shadow-xl">
      <p className="flex flex-col items-end">
        <span className="font-semibold text-2xl">{formattedTime}</span>
        <span className="text-xs"> {timeZone}</span>
      </p>
    </div>
  );
}
