const Loader = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-3">
      <div className="relative">
        {/* Outer Glow Effect */}
        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>

        {/* Spinning Icon */}
        <svg
          className="animate-spin h-10 w-10 text-green-400 relative z-10"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      {/* Loading Text */}
      <p className="text-slate-400 text-sm font-medium tracking-widest animate-pulse uppercase">
        {message || "Analyzing Match Data..."}
      </p>
    </div>
  );
};

export default Loader;
