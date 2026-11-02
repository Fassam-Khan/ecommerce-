"use client";

// Backward compatible: <InfoInput placeholder="Email" width="100%" type="email" /> still works.
// New optional props: name, value, onChange, onBlur, error, autoComplete, inputMode
const InfoInput = ({
  placeholder,
  width = "100%",
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  inputMode,
}) => {
  const id = name || placeholder;
  return (
    <div style={{ width }} className="flex flex-col">
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`peer h-[52px] w-full rounded-md border bg-white px-3 pb-1 pt-5 text-sm outline-none transition
            ${
              error
                ? "border-red-600 ring-1 ring-red-600"
                : "border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            }`}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-[26px] -translate-y-1/2 text-sm text-gray-500 transition-all
            peer-focus:top-[14px] peer-focus:text-xs
            peer-[:not(:placeholder-shown)]:top-[14px] peer-[:not(:placeholder-shown)]:text-xs"
        >
          {placeholder}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 4h2v6H9V6zm0 8h2v2H9v-2z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default InfoInput;