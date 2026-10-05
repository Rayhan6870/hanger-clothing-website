type CheckoutFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
  inputMode?: "text" | "tel";
};

export function CheckoutField({ label, value, placeholder, error, onChange, inputMode }: CheckoutFieldProps) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <label className="block" htmlFor={`checkout-${id}`}>
      <span className="mb-1.5 block text-[10px] font-semibold text-white/60">{label}</span>
      <input id={`checkout-${id}`} data-testid={`input-${id}`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode ?? "text"} className={`w-full rounded-lg border bg-[#171717] px-3.5 py-3 text-[11px] text-white outline-none placeholder:text-white/25 focus:border-[#E10600]/70 ${error ? "border-[#E10600]" : "border-white/10"}`} />
      {error && <span className="mt-1 block text-[9px] text-[#ff6b67]">{error}</span>}
    </label>
  );
}
