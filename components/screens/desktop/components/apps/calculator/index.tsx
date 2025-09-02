"use client";

export function CalculatorApp({ instanceId }: { instanceId: string }) {
  return (
    <div className="text-white p-4">
      <p className="font-semibold m-0">Calculator</p>
      <p className="opacity-80 mt-2">Instance: {instanceId}</p>
      {/* ...your calculator UI here... */}
    </div>
  );
}
