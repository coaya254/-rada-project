import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Calendar, User, TrendingUp, CheckCircle, XCircle, Clock, ExternalLink, X } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/polihub/bills`);
      const data = await response.json();
      if (data.success) {
        setBills(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed':
      case 'enacted':
        return 'bg-green-100 text-green-700';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
      case 'in committee':
        return 'bg-yellow-100 text-yellow-700';
      case 'in debate':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed':
      case 'enacted':
        return <CheckCircle size={16} />;
      case 'failed':
      case 'rejected':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bill.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesCategory = filterCategory === 'all' || bill.category?.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Bills & Legislation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track bills being debated in Parliament. See who sponsored them and how they voted.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bills..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in committee">In Committee</option>
              <option value="in debate">In Debate</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="finance">Finance</option>
              <option value="agriculture">Agriculture</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="governance">Governance</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredBills.length} of {bills.length} bills
          </div>
        </div>

        {/* Bills List */}
        {filteredBills.length > 0 ? (
          <div className="grid gap-6">
            {filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 cursor-pointer border-2 border-transparent hover:border-blue-500"
                onClick={() => setSelectedBill(bill)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    {/* Bill Number & Status */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-mono text-sm font-bold text-blue-600">
                        {bill.bill_number || `BILL-${bill.id}`}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(bill.status)}`}>
                        {getStatusIcon(bill.status)}
                        {bill.status || 'Pending'}
                      </span>
                      {bill.category && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                          {bill.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      {bill.title || bill.short_title}
                    </h3>

                    {/* Description */}
                    {bill.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {bill.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {bill.sponsor_name && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          <strong>Sponsor:</strong> {bill.sponsor_name}
                        </span>
                      )}
                      {bill.introduced_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(bill.introduced_date).toLocaleDateString()}
                        </span>
                      )}
                      {bill.vote_count > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp size={14} />
                          {bill.vote_count} votes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View Button */}
                  <button
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-bold transition whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBill(bill);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bills Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Bill Detail Modal */}
        {selectedBill && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBill(null)}>
            <div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b p-6 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-bold text-blue-600">
                      {selectedBill.bill_number || `BILL-${selectedBill.id}`}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(selectedBill.status)}`}>
                      {getStatusIcon(selectedBill.status)}
                      {selectedBill.status || 'Pending'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {selectedBill.title || selectedBill.short_title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Summary */}
                {selectedBill.summary && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700">{selectedBill.summary}</p>
                  </div>
                )}

                {/* Description */}
                {selectedBill.description && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedBill.description}</p>
                  </div>
                )}

                {/* Sponsor */}
                {selectedBill.sponsor_name && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Sponsor</h3>
                    <div className="flex items-center gap-3">
                      <User size={20} className="text-blue-600" />
                      <span className="text-gray-700">{selectedBill.sponsor_name}</span>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-3">
                    {selectedBill.introduced_date && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                        <div>
                          <div className="font-bold text-gray-900">Introduced</div>
                          <div className="text-sm text-gray-600">
                            {new Date(selectedBill.introduced_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedBill.last_action_date && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                        <div>
                          <div className="font-bold text-gray-900">Last Action</div>
                          <div className="text-sm text-gray-600">
                            {new Date(selectedBill.last_action_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                <div className="pt-4 border-t">
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                    onClick={() => window.alert('View full text - to be implemented')}
                  >
                    <ExternalLink size={20} />
                    View Full Bill Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
