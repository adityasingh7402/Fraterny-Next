'use client';

import { useState, useEffect } from 'react';
import { Influencer, ApiResponse } from '@/lib/types';

interface InfluencersListProps {
  initialData?: Influencer[];
}

export default function InfluencersList({ initialData }: InfluencersListProps) {
  const [influencers, setInfluencers] = useState<Influencer[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/influencers?${params}`);
      const result: ApiResponse<Influencer[]> = await response.json();

      if (result.status === 'success') {
        setInfluencers(result.data);
      } else {
        setError(result.message || 'Failed to fetch influencers');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchInfluencers();
    }
  }, [initialData]);

  const handleSearch = () => {
    fetchInfluencers();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !initialData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading influencers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">⚠️ {error}</div>
        <button 
          onClick={fetchInfluencers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Fraterny Influencers</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {influencers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No influencers found. Try adjusting your search criteria.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {influencers.map((influencer) => (
            <div key={influencer.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {influencer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{influencer.name}</h3>
                    <p className="text-sm text-gray-600">{influencer.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(influencer.status)}`}>
                  {influencer.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Affiliate Code:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">{influencer.affiliate_code}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission:</span>
                  <span className="font-semibold text-gray-900">{influencer.commission_rate}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(influencer.total_earnings)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(influencer.remaining_balance)}</span>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Clicks: <span className="font-medium">{influencer.total_clicks}</span></div>
                    <div>Signups: <span className="font-medium">{influencer.total_signups}</span></div>
                    <div>Purchases: <span className="font-medium">{influencer.total_purchases}</span></div>
                    <div>Rate: <span className="font-medium">{influencer.conversion_rate}%</span></div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-gray-500">
                  Joined: {formatDate(influencer.created_at)}
                  {influencer.is_india && <span className="ml-2 text-blue-600">🇮🇳</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        Showing {influencers.length} influencers
      </div>
    </div>
  );
}