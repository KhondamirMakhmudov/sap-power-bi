'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import { mockForecastData } from '@/data/mockData';

export default function ForecastPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forecast & Predictions</h1>
          <p className="text-gray-600 mt-1">AI-powered revenue and sales forecasts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-sm text-gray-600 font-medium">Q2 2024 Forecast</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">$1.83M</h3>
            <p className="text-sm text-green-600 mt-2">+15% vs Q1</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 font-medium">Confidence Level</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">94%</h3>
            <p className="text-sm text-green-600 mt-2">High accuracy</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 font-medium">Predicted Growth</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">+12.4%</h3>
            <p className="text-sm text-green-600 mt-2">YoY comparison</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">6-Month Forecast</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Period</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actual</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Predicted</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Lower Bound</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Upper Bound</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {mockForecastData.map((forecast, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{forecast.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {forecast.actual > 0 ? `$${(forecast.actual / 1000).toFixed(0)}K` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      ${(forecast.predicted / 1000).toFixed(0)}K
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">${(forecast.lower / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-4 text-sm text-gray-600">${(forecast.upper / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                        {idx < 3 ? '98%' : '94%'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-medium text-gray-900">Strong Growth Trajectory</p>
                <p className="text-sm text-gray-600 mt-1">Revenue is expected to grow steadily across all quarters</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-gray-900">High Model Accuracy</p>
                <p className="text-sm text-gray-600 mt-1">94% confidence level in forecasts based on historical data</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium text-gray-900">Monitor Q3 Seasonality</p>
                <p className="text-sm text-gray-600 mt-1">Q3 historically shows 8-12% variance, plan accordingly</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
