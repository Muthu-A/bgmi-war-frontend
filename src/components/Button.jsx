import { Loader2 } from "lucide-react";

export default function Button({ 
  children, 
  onClick, 
  loading = false, 
  disabled = false, 
  variant = "primary", // primary, secondary, danger
  className = "",
  type = "button"
}) {
  
  // Dynamic styling based on variants
  const variants = {
    primary: "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600",
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative items-center justify-center px-6 py-2.5 rounded-lg 
        font-bold tracking-wide transition-all duration-200 
        active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
        min-h-[30px] min-w-[120px]
        ${variants[variant]}
        ${className}
      `}
    >
      {/* Loader - Only visible when loading is true */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-current" />
        </div>
      )}

      {/* Button Text - Hidden when loading is true */}
      <span className={`${loading ? "opacity-0" : "opacity-100"} transition-opacity`}>
        {children}
      </span>
    </button>
  );
}