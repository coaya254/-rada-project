import React, { useState } from 'react';
import { CheckCircle, TrendingUp, Clock as ClockIcon, Pause, HelpCircle, Calendar, Target } from 'lucide-react';

export default function PromisesTab({ politicianId }) {
  const [filterStatus, setFilterStatus] = useState('All');

  // Sample data - replace with API call
  const promises = [
    {
      id: 1,
      title: 'Achieve 100% Clean Energy by 2030',
      category: 'Climate',
      description: 'Transition the United States to 100% renewable energy sources including wind, solar, and hydroelectric power by 2030.',
      status: 'significant_progress',
      date_made: '2019-01-15',
      deadline: '2030-12-31',
      progress: 45,
      updates: [
        { date: '2024-10-01', text: 'Passed Clean Energy Investment Act providing $500B in funding' },
        { date: '2024-06-15', text: 'Secured bipartisan support for renewable energy tax credits' }
      ]
    },
    {
      id: 2,
      title: 'Cancel $50,000 in Student Debt',
      category: 'Education',
      description: 'Forgive up to $50,000 in federal student loan debt for borrowers earning under $125,000 annually.',
      status: 'stalled',
      date_made: '2020-11-05',
      deadline: '2024-12-31',
      progress: 15,
      updates: [
        { date: '2023-08-20', text: 'Executive action blocked by Supreme Court' },
        { date: '2023-03-10', text: 'Alternative debt relief plan introduced' }
      ]
    },
    {
      id: 3,
      title: 'Raise Federal Minimum Wage to $15',
      category: 'Labor',
      description: 'Increase the federal minimum wage from $7.25 to $15 per hour.',
      status: 'completed',
      date_made: '2019-01-03',
      deadline: '2023-06-30',
      progress: 100,
      updates: [
        { date: '2023-06-15', text: 'President signed Raise the Wage Act into law' },
        { date: '2023-05-20', text: 'Senate passed bill 52-48' },
        { date: '2023-03-10', text: 'House passed bill 231-199' }
      ]
    },
    {
      id: 4,
      title: 'Expand Medicare to Include Dental and Vision',
      category: 'Healthcare',
      description: 'Add comprehensive dental and vision coverage to Medicare benefits.',
      status: 'early_progress',
      date_made: '2021-02-20',
      deadline: '2025-12-31',
      progress: 25,
      updates: [
        { date: '2024-09-05', text: 'Committee hearings held on Medicare expansion' },
        { date: '2024-04-12', text: 'Pilot program launched in 5 states' }
      ]
    },
    {
      id: 5,
      title: 'Build 1 Million Affordable Housing Units',
      category: 'Housing',
      description: 'Construct one million new affordable housing units in urban and rural areas across America.',
      status: 'no_evidence',
      date_made: '2022-06-10',
      deadline: '2026-12-31',
      progress: 0,
      updates: []
    }
  ];

  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle size={16} />
        };
      case 'significant_progress':
        return {
          label: 'Significant Progress',
          color: 'bg-green-400',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <TrendingUp size={16} />
        };
      case 'early_progress':
        return {
          label: 'Early Progress',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: <ClockIcon size={16} />
        };
      case 'stalled':
        return {
          label: 'Stalled',
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <Pause size={16} />
        };
      case 'no_evidence':
        return {
          label: 'No Evidence',
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <HelpCircle size={16} />
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <HelpCircle size={16} />
        };
    }
  };

  const filteredPromises = filterStatus === 'All'
    ? promises
    : promises.filter(p => {
        if (filterStatus === 'Completed') return p.status === 'completed';
        if (filterStatus === 'In Progress') return ['significant_progress', 'early_progress'].includes(p.status);
        if (filterStatus === 'Stalled') return p.status === 'stalled';
        if (filterStatus === 'No Evidence') return p.status === 'no_evidence';
        return true;
      });

  return (
    <div className="promises-tab">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {['All', 'Completed', 'In Progress', 'Stalled', 'No Evidence'].map(filter => (
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

      {/* Promise Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-green-50 rounded-xl p-3 border-2 border-green-100">
          <div className="text-xl font-black text-green-700">
            {promises.filter(p => p.status === 'completed').length}
          </div>
          <div className="text-xs text-green-600 font-semibold">Completed</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border-2 border-green-100">
          <div className="text-xl font-black text-green-600">
            {promises.filter(p => p.status === 'significant_progress').length}
          </div>
          <div className="text-xs text-green-600 font-semibold">Significant</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 border-2 border-yellow-100">
          <div className="text-xl font-black text-yellow-700">
            {promises.filter(p => p.status === 'early_progress').length}
          </div>
          <div className="text-xs text-yellow-600 font-semibold">Early</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border-2 border-red-100">
          <div className="text-xl font-black text-red-700">
            {promises.filter(p => p.status === 'stalled').length}
          </div>
          <div className="text-xs text-red-600 font-semibold">Stalled</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-100">
          <div className="text-xl font-black text-gray-700">
            {promises.filter(p => p.status === 'no_evidence').length}
          </div>
          <div className="text-xs text-gray-600 font-semibold">No Evidence</div>
        </div>
      </div>

      {/* Promise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPromises.map(promise => {
          const statusConfig = getStatusConfig(promise.status);
          
          return (
            <div 
              key={promise.id}
              className={`rounded-2xl p-6 shadow-lg hover:shadow-xl transition border-2 ${statusConfig.bgColor} ${statusConfig.borderColor}`}
            >
              {/* Status Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${statusConfig.color}`}></div>
                <span className={`text-xs font-bold uppercase ${statusConfig.textColor}`}>
                  {statusConfig.label}
                </span>
              </div>

              {/* Category Badge */}
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-3">
                {promise.category}
              </span>

              {/* Title */}
              <h4 className="text-base sm:text-lg font-black text-gray-800 mb-2">{promise.title}</h4>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {promise.description}
              </p>

              {/* Dates */}
              <div className="flex flex-col gap-2 text-xs text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Target size={12} />
                  <span>Made: {new Date(promise.date_made).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
                {promise.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    <span>Deadline: {new Date(promise.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {promise.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-semibold">Progress</span>
                    <span className={`font-bold ${statusConfig.textColor}`}>{promise.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${statusConfig.color}`}
                      style={{ width: `${promise.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Recent Updates */}
              {promise.updates && promise.updates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="text-xs font-bold text-gray-700 mb-2">Recent Updates</h5>
                  <div className="space-y-2">
                    {promise.updates.slice(0, 2).map((update, idx) => (
                      <div key={idx} className="text-xs text-gray-600">
                        <span className="font-semibold">
                          {new Date(update.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}:
                        </span>{' '}
                        {update.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPromises.length === 0 && (
        <div className="text-center py-16 sm:py-20">
          <Target size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No Promises Found</h3>
          <p className="text-gray-500">Try selecting a different filter</p>
        </div>
      )}
    </div>
  );
}