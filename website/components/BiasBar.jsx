export default function BiasBar({ bias }) {
  const total = Math.max(1, (bias?.left || 0) + (bias?.center || 0) + (bias?.right || 0));
  const w = v => `${(v / total) * 100}%`;

  return (
    <div className="mt-3">
      <div className="flex h-3 w-full rounded overflow-hidden">
        <div style={{ width: w(bias.left || 0) }} className="bg-blue-600" />
        <div style={{ width: w(bias.center || 0) }} className="bg-zinc-400" />
        <div style={{ width: w(bias.right || 0) }} className="bg-red-600" />
      </div>
      <div className="flex justify-between text-[11px] mt-1 text-zinc-400">
        <span>Left {bias.left || 0}%</span>
        <span>Center {bias.center || 0}%</span>
        <span>Right {bias.right || 0}%</span>
      </div>
    </div>
  );
}
