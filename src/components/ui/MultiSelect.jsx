"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// `selected` never contains `allValue` — checking "all" fills it with every
// real code explicitly (the caller's default state should start this way too),
// so the outgoing request always lists codes rather than relying on omission.
export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Все",
  allValue = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allOption = options.find((o) => o.value === allValue);
  const realOptions = options.filter((o) => o.value !== allValue);
  const realValues = realOptions.map((o) => o.value);
  const isAllSelected =
    realValues.length > 0 && realValues.every((v) => selected.includes(v));

  const summary = isAllSelected
    ? allOption?.label ?? placeholder
    : selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (realOptions.find((o) => o.value === selected[0])?.label ?? selected[0])
        : `Выбрано: ${selected.length}`;

  const toggle = (value) => {
    if (value === allValue) {
      onChange(isAllSelected ? [] : realValues);
      return;
    }
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          {label}
        </label>
      )}

      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-gray-900 font-medium flex items-center justify-between hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 dark:hover:border-gray-500"
      >
        <span className={isAllSelected ? "text-gray-500 dark:text-gray-400" : ""}>
          {summary}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden min-w-full w-max dark:bg-gray-800 dark:border-gray-600"
        >
          <div className="py-2 max-h-72 overflow-y-auto">
            {allOption && (
              <>
                <label className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => toggle(allValue)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                  />
                  {allOption.label}
                </label>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              </>
            )}
            {realOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer whitespace-nowrap"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggle(option.value)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
