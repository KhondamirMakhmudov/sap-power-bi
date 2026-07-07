'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { isAuthenticated } from '@/utils/auth';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { mockRegionData } from '@/data/mockData';

export default function RegionsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Regional Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track performance across all regions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Revenue</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">$1.23M</h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+14.2% vs last period</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Sales</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">8,830</h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+12.1% growth</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Growth</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">15.2%</h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">All regions trending up</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Regional Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRegionData.map((region) => (
              <div
                key={region.id}
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{region.name}</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">${(region.revenue / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sales</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{region.sales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Customers</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{region.customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">+{region.growth.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${region.growth * 5}%` }} />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </Card>
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
