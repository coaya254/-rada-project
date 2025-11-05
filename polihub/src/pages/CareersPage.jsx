import React, { useState } from 'react';
import { Briefcase, MapPin, Clock, DollarSign, Users, Heart, TrendingUp, Send, CheckCircle } from 'lucide-react';

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const jobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'Competitive',
      description: 'Build scalable civic tech solutions that empower citizens.',
      requirements: ['5+ years React/Node.js', 'Experience with APIs', 'Passion for civic tech'],
      responsibilities: ['Develop new features', 'Mentor junior developers', 'Code reviews']
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'Competitive',
      description: 'Lead product strategy for our civic engagement platform.',
      requirements: ['3+ years product management', 'Data-driven mindset', 'User-focused'],
      responsibilities: ['Define product roadmap', 'Work with stakeholders', 'Launch features']
    },
    {
      id: 3,
      title: 'Content Writer',
      department: 'Content',
      location: 'Remote',
      type: 'Part-time',
      salary: 'KES 50-80K',
      description: 'Create engaging political and civic education content.',
      requirements: ['Excellent writing skills', 'Knowledge of Kenyan politics', 'Research skills'],
      responsibilities: ['Write articles', 'Research topics', 'Edit content']
    },
    {
      id: 4,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Nairobi, Kenya / Remote',
      type: 'Full-time',
      salary: 'Competitive',
      description: 'Design intuitive experiences for civic engagement.',
      requirements: ['Portfolio of work', 'Figma proficiency', 'User research experience'],
      responsibilities: ['Design interfaces', 'User research', 'Prototyping']
    }
  ];

  const benefits = [
    { icon: Heart, title: 'Health Insurance', desc: 'Comprehensive medical cover for you and family' },
    { icon: TrendingUp, title: 'Career Growth', desc: 'Learning budget and mentorship programs' },
    { icon: Clock, title: 'Flexible Hours', desc: 'Work-life balance with flexible schedules' },
    { icon: Users, title: 'Great Team', desc: 'Work with passionate, talented people' }
  ];

  const handleApply = (job) => {
    setSelectedJob(job);
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    setApplicationSubmitted(true);
  };

  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying for <strong>{selectedJob?.title}</strong>. We'll review your application and get back to you soon.
            </p>
            <button
              onClick={() => {
                setApplicationSubmitted(false);
                setSelectedJob(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold"
            >
              Back to Careers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedJob(null)}
            className="mb-6 text-blue-600 hover:text-blue-700 font-bold"
          >
            ← Back to All Jobs
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-black text-gray-900 mb-4">{selectedJob.title}</h2>
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                {selectedJob.location}
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                {selectedJob.type}
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <DollarSign size={16} />
                {selectedJob.salary}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Description</h3>
              <p className="text-gray-700">{selectedJob.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Requirements</h3>
              <ul className="space-y-2">
                {selectedJob.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-3">Responsibilities</h3>
              <ul className="space-y-2">
                {selectedJob.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmitApplication} className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">Quick Application</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="LinkedIn Profile (optional)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Resume/CV (PDF) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <textarea
                  placeholder="Why do you want to join us? *"
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us build technology that empowers citizens and strengthens democracy
          </p>
        </div>

        {/* Company Values */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-12 text-white">
          <h2 className="text-3xl font-black mb-6">Why Work With Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center">
                <benefit.icon size={48} className="mx-auto mb-3" />
                <h3 className="font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm opacity-90">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-8">Open Positions ({jobs.length})</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-sm text-blue-600 font-bold">{job.department}</p>
                  </div>
                  <Briefcase className="text-gray-400" size={24} />
                </div>

                <p className="text-gray-600 mb-4 text-sm">{job.description}</p>

                <div className="flex flex-wrap gap-3 mb-4 text-xs">
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin size={14} />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock size={14} />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <DollarSign size={14} />
                    {job.salary}
                  </span>
                </div>

                <button
                  onClick={() => handleApply(job)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
                >
                  View Details & Apply
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* No Position Found */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Don't see the right role?
          </h3>
          <p className="text-gray-600 mb-4">
            We're always looking for talented people. Send us your resume anyway!
          </p>
          <a
            href="mailto:careers@radamobile.com"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold"
          >
            Email Us Your Resume
          </a>
        </div>
      </div>
    </div>
  );
}
