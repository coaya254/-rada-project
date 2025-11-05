import React, { useState } from 'react';
import { FileText, Users, Clock, ExternalLink, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function BillsTab({ politicianId }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedBill, setExpandedBill] = useState(null);

  // Sample data - replace with API call
  const bills = [
    {
      id: 1,
      bill_number: 'H.R. 2021',
      title: 'Green New Deal Resolution',
      summary: 'A comprehensive plan to address climate change and create millions of high-wage jobs in clean energy industries.',
      status: 'Introduced',
      date_introduced: '2019-02-07',
      cosponsors: 95,
      category: 'Environment',
      full_text_url: 'https://congress.gov/bill/116th-congress/house-resolution/109',
      progress_stage: 'Committee Review'
    },
    {
      id: 2,
      bill_number: 'H.R. 5325',
      title: 'Affordable Housing Act',
      summary: 'Legislation to provide $100 billion in funding for affordable housing development and rental assistance programs.',
      status: 'Passed House',
      date_introduced: '2021-09-20',
      cosponsors: 42,
      category: 'Housing',
      full_text_url: 'https://congress.gov/bill/117th-congress/house-bill/5325',
      progress_stage: 'Senate Review'
    },
    {
      id: 3,
      bill_number: 'H.R. 1234',
      title: 'Student Loan Forgiveness Act',
      summary: 'Proposes cancellation of up to $50,000 in federal student loan debt for borrowers earning under $125,000 annually.',
      status: 'In Committee',
      date_introduced: '2023-03-15',
      cosponsors: 68,
      category: 'Education',
      full_text_url: 'https://congress.gov/bill/118th-congress/house-bill/1234',
      progress_stage: 'Committee Hearings'
    },
    {
      id: 4,
      bill_number: 'H.R. 8910',
      title: 'Medicare for All Act',
      summary: 'Establishes a national health insurance program to provide universal healthcare coverage for all Americans.',
      status: 'Failed',
      date_introduced: '2019-02-27',
      cosponsors: 118,
      category: 'Healthcare',
      full_text_url: 'https://congress.gov/bill/116th-congress/house-bill/1384',
      progress_stage: 'Did Not Advance'
    },
    {
      id: 5,
      bill_number: 'H.R. 7456',
      title: 'Worker Protection Act',
      summary: 'Strengthens labor protections, increases minimum wage to $15/hour, and expands collective bargaining rights.',
      status: 'Enacted',
      date_introduced: '2021-05-10',
      cosponsors: 156,
      category: 'Labor',
      full_text_url: 'https://congress.gov/bill/117th-congress/house-bill/7456',
      progress_stage: 'Signed into Law'
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Enacted':
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={16} /> };
      case 'Passed House':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <CheckCircle size={16} /> };
      case 'In Committee':
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <AlertCircle size={16} /> };
      case 'Introduced':
        return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <FileText size={16} /> };
      case 'Failed':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={16} /> };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <FileText size={16} /> };
    }
  };

  const filteredBills = filterStatus === 'All'
    ? bills
    : bills.filter(bill => bill.status === filterStatus);

  // Sort by date descending
  const sortedBills = [...filteredBills].sort((a, b) => 
    new Date(b.date_introduced) - new Date(a.date_introduced)
  );

  return (
    <div className="bills-tab">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {['All', 'Enacted', 'Passed House', 'In Committee', 'Introduced', 'Failed'].map(filter => (
          <button
            key={filter}
            onClick={() => setFilterStatus(filter)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition ${
              filterStatus === filter
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Bill Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100">
          <div className="text-xl sm:text-2xl font-black text-gray-800">{bills.length}</div>
          <div className="text-sm text-gray-600 font-semibold">Total Bills</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-lg border-2 border-green-100">
          <div className="text-xl sm:text-2xl font-black text-green-700">
            {bills.filter(b => b.status === 'Enacted').length}
          </div>
          <div className="text-sm text-green-600 font-semibold">Enacted</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-lg border-2 border-blue-100">
          <div className="text-xl sm:text-2xl font-black text-blue-700">
            {bills.filter(b => b.status === 'Passed House').length}
          </div>
          <div className="text-sm text-blue-600 font-semibold">Passed House</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow-lg border-2 border-yellow-100">
          <div className="text-xl sm:text-2xl font-black text-yellow-700">
            {bills.filter(b => b.status === 'In Committee').length}
          </div>
          <div className="text-sm text-yellow-600 font-semibold">In Committee</div>
        </div>
      </div>

      {/* Bill Cards */}
      <div className="space-y-4">
        {sortedBills.map(bill => {
          const statusBadge = getStatusBadge(bill.status);
          
          return (
            <div 
              key={bill.id}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition border-2 border-transparent hover:border-purple-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      {bill.bill_number}
                    </span>
                    {bill.category && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        {bill.category}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-gray-800">{bill.title}</h4>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-4 py-2 rounded-full font-bold text-sm border-2 flex items-center gap-2 ${statusBadge.color}`}>
                  {statusBadge.icon}
                  {bill.status}
                </span>
                {bill.progress_stage && (
                  <span className="text-xs text-gray-500 font-semibold">
                    • {bill.progress_stage}
                  </span>
                )}
              </div>

              {/* Summary */}
              <p className={`text-sm text-gray-600 leading-relaxed mb-4 transition-all ${
                expandedBill === bill.id ? '' : 'line-clamp-2'
              }`}>
                {bill.summary}
              </p>

              {/* Expand Button */}
              <button
                onClick={() => setExpandedBill(expandedBill === bill.id ? null : bill.id)}
                className="mb-4 flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-700 transition"
              >
                {expandedBill === bill.id ? (
                  <>
                    <ChevronUp size={16} />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Read more
                  </>
                )}
              </button>

              {/* Footer Info */}
              <div className="flex flex-wrap gap-4 text-sm pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>Introduced: {new Date(bill.date_introduced).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} />
                  <span>{bill.cosponsors} Co-sponsors</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <a
                  href={bill.full_text_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <ExternalLink size={18} />
                  Read Full Text
                </a>
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition">
                  Share
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedBills.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No Bills Found</h3>
          <p className="text-gray-500">Try selecting a different filter</p>
        </div>
      )}
    </div>
  );
}