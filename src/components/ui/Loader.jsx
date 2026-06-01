"use client";

export default function Loader({
  label = "Загрузка данных...",
  fullWidth = true,
  className = "",
  hint = "Подготавливаем KPI и данные по станциям",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/60 to-transparent animate-pulse" />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 ring-1 ring-gray-200">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
          </span>

          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900">{label}</p>
            <p className="mt-1 text-sm text-gray-500">{hint}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>

        <p className="text-xs text-gray-400">
          Это может занять несколько секунд
        </p>
      </div>

      <span className="sr-only">Идет загрузка</span>
    </div>
  );
}
