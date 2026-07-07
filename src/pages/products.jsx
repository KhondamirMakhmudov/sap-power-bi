'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { isAuthenticated } from '@/utils/auth';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { mockProductData } from '@/data/mockData';

export default function ProductsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor product performance and sales</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: '24', change: '+3' },
            { label: 'Active SKUs', value: '18', change: '+2' },
            { label: 'Total Revenue', value: '$1.2M', change: '+18.5%' },
            { label: 'Avg Margin', value: '48%', change: '+2.3%' }
          ].map((stat, idx) => (
            <Card key={idx} className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</h3>
              <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stat.change}
              </p>
            </Card>
          ))}
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Top Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Revenue</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Units Sold</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Growth</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Margin</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockProductData.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{product.category}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">${(product.revenue / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{product.units.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1">
                        {product.growth > 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400 font-semibold">+{product.growth.toFixed(1)}%</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-red-600 dark:text-red-400 font-semibold">{product.growth.toFixed(1)}%</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{product.margin}%</td>
                    <td className="py-3 px-4 text-sm">
                      <Badge
                        variant={
                          product.status === 'high' ? 'success' : product.status === 'low' ? 'warning' : 'info'
                        }
                        size="sm"
                      >
                        {product.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
