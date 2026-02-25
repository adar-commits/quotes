export default function DefaultAvatar() {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 ring-2 ring-slate-300/50"
      aria-hidden
    >
      <svg
        className="h-1/2 w-1/2 text-slate-500"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}
