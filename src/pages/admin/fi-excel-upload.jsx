"use client";

import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";

// Hidden admin page — intentionally not listed in Sidebar.jsx's sidebarItems.
// Reachable only by direct URL, guarded by the same shared-login session as
// every other page. Lets someone drop a new "Д-т К-т ДД.ММ.ГГГГ.xlsx"
// snapshot into public/files/ without touching code; fi_bp_excel.js then
// auto-picks whichever uploaded file has the latest date in its filename.
export default function FiExcelUploadPage() {
  const [files, setFiles] = useState([]);
  const [active, setActive] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadList = () => {
    fetch("/api/admin/list-fi-excel")
      .then((res) => res.json())
      .then((json) => {
        setFiles(json.files || []);
        setActive(json.active || null);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Выберите файл");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/upload-fi-excel", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || `Ошибка сервера: ${res.status}`);
      }

      setMessage(`Файл "${json.fileName}" загружен`);
      setSelectedFile(null);
      loadList();
    } catch (e) {
      setError(e?.message || "Ошибка загрузки файла");
    } finally {
      setUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Загрузка Excel: Дебиторы/Кредиторы
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Загрузите новый снимок «Д-т К-т ДД.ММ.ГГГГ.xlsx» — страница «Дебиторы и Кредиторы»
            автоматически возьмёт файл с самой поздней датой в названии.
          </p>
        </div>

        <form
          onSubmit={handleUpload}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Файл (формат: Д-т К-т ДД.ММ.ГГГГ.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500"
          >
            {uploading ? "Загрузка..." : "Загрузить"}
          </button>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
        </form>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Загруженные файлы</h2>
          {files.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500">Файлов пока нет</p>
          )}
          <ul className="space-y-2">
            {files.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between text-sm py-1.5 px-3 rounded-md bg-gray-50 dark:bg-gray-900/40"
              >
                <span className="text-gray-700 dark:text-gray-300">{name}</span>
                {name === active && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                    активен
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
}
