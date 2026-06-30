import { useRouter } from "next/router";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-blue-500 leading-none">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Страница не найдена</h1>
        <p className="mt-2 text-slate-400 max-w-sm mx-auto">
          Запрошенная страница не существует или была перемещена.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-slate-600 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Назад
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}
