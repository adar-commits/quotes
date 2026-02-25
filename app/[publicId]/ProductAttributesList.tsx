const BRAND_RED = "#801a1e";

type Attribute = { label: string; value: string };

export default function ProductAttributesList({
  attributes,
  className = "",
}: {
  attributes: Attribute[];
  className?: string;
}) {
  return (
    <ul
      className={`space-y-2.5 text-right ${className}`}
      aria-label="מאפייני מוצר"
    >
      {attributes.map(({ label, value }) => (
        <li
          key={label}
          className="flex items-center justify-end gap-2 py-1.5 border-b border-slate-100 last:border-0 last:pb-0"
        >
          <span className="text-slate-600 text-[0.8125rem]">{value}</span>
          <span
            className="font-bold text-[0.8125rem] shrink-0"
            style={{ color: BRAND_RED }}
          >
            {label}:
          </span>
          <span
            className="order-first w-1.5 h-1.5 rounded-full shrink-0 opacity-90"
            style={{ backgroundColor: BRAND_RED }}
            aria-hidden
          />
        </li>
      ))}
    </ul>
  );
}
