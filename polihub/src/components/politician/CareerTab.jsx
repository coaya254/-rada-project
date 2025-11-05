import React, { useState } from 'react';
import { GraduationCap, Award, Briefcase, AlertTriangle, Building, MapPin, Calendar } from 'lucide-react';

export default function CareerTab({ politicianId }) {
  const [activeSection, setActiveSection] = useState('education');

  // Sample data - replace with API call
  const careerData = {
    education: [
      {
        id: 1,
        institution: 'Boston University',
        degree: 'Bachelor of Arts',
        major: 'Economics and International Relations',
        graduation_year: 2011,
        honors: 'Cum Laude',
        details: 'Graduated fourth in her class with dual degree in Economics and International Relations.'
      },
      {
        id: 2,
        institution: 'Yorktown High School',
        degree: 'High School Diploma',
        graduation_year: 2007,
        honors: 'Valedictorian',
        details: 'Won second place in the Intel International Science and Engineering Fair with microbiology research project.'
      }
    ],
    
    achievements: [
      {
        id: 1,
        title: 'Youngest Woman Ever Elected to Congress',
        date: '2018-11-06',
        description: 'At age 29, became the youngest woman ever elected to the United States Congress.',
        category: 'Political'
      },
      {
        id: 2,
        title: 'Time 100 Most Influential People',
        date: '2019-04-17',
        description: 'Named to TIME Magazine\'s list of 100 Most Influential People in the World.',
        category: 'Recognition'
      },
      {
        id: 3,
        title: 'Green New Deal Co-Sponsor',
        date: '2019-02-07',
        description: 'Co-sponsored groundbreaking Green New Deal resolution addressing climate change.',
        category: 'Legislative'
      },
      {
        id: 4,
        title: 'Raised Over $10M Without Corporate PACs',
        date: '2020-11-03',
        description: 'Successfully raised campaign funds entirely from individual donors, refusing corporate PAC money.',
        category: 'Campaign'
      }
    ],

    controversies: [
      {
        id: 1,
        title: 'Amazon HQ2 Opposition',
        date: '2019-02-14',
        description: 'Opposed Amazon\'s planned headquarters in Queens, citing concerns about tax breaks and gentrification. Critics argued it cost the district jobs.',
        impact: 'Medium',
        resolution: 'Amazon withdrew from New York plans'
      },
      {
        id: 2,
        title: '"Defund the Police" Remarks',
        date: '2020-06-30',
        description: 'Comments supporting police budget reductions drew criticism from moderate Democrats and Republicans.',
        impact: 'High',
        resolution: 'Clarified position in subsequent statements'
      },
      {
        id: 3,
        title: 'Met Gala "Tax the Rich" Dress',
        date: '2021-09-13',
        description: 'Wore designer dress with "Tax the Rich" slogan to Met Gala, facing criticism for attending expensive event.',
        impact: 'Low',
        resolution: 'Defended as political statement and platform'
      }
    ],

    experience: [
      {
        id: 1,
        position: 'U.S. Representative',
        organization: 'U.S. House of Representatives',
        location: 'Washington, D.C.',
        start_date: '2019-01-03',
        end_date: 'Present',
        description: 'Representing New York\'s 14th congressional district. Member of House Financial Services Committee and House Oversight and Reform Committee.'
      },
      {
        id: 2,
        position: 'Community Organizer',
        organization: 'National Hispanic Institute',
        location: 'New York, NY',
        start_date: '2017-01-01',
        end_date: '2018-12-31',
        description: 'Organized community events and voter registration drives in the Bronx.'
      },
      {
        id: 3,
        position: 'Educational Director',
        organization: 'Brook Avenue Press',
        location: 'Bronx, NY',
        start_date: '2012-01-01',
        end_date: '2016-12-31',
        description: 'Managed educational programs and community outreach for children\'s book publisher.'
      },
      {
        id: 4,
        position: 'Bartender & Waitress',
        organization: 'Flats Fix',
        location: 'New York, NY',
        start_date: '2011-01-01',
        end_date: '2017-12-31',
        description: 'Worked in service industry while pursuing political activism and community organizing.'
      }
    ]
  };

  return (
    <div className="career-tab">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {[
          { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
          { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
          { id: 'achievements', label: 'Achievements', icon: <Award size={16} /> },
          { id: 'controversies', label: 'Controversies', icon: <AlertTriangle size={16} /> }
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition flex items-center gap-2 ${
              activeSection === section.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Education Section */}
      {activeSection === 'education' && (
        <div className="space-y-4">
          {careerData.education.map(edu => (
            <div key={edu.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border-2 border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-black text-gray-800 mb-1">{edu.institution}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {edu.degree}
                    </span>
                    {edu.major && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        {edu.major}
                      </span>
                    )}
                    {edu.honors && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        {edu.honors}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <Calendar size={14} className="inline mr-1" />
                    Graduated {edu.graduation_year}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{edu.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience Section */}
      {activeSection === 'experience' && (
        <div className="space-y-4">
          {careerData.experience.map(exp => (
            <div key={exp.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border-2 border-purple-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="text-purple-600" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-black text-gray-800 mb-1">{exp.position}</h4>
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                    <Building size={14} />
                    <span className="font-semibold">{exp.organization}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {exp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {' - '}
                      {exp.end_date === 'Present' ? 'Present' : new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements Section */}
      {activeSection === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {careerData.achievements.map(achievement => (
            <div key={achievement.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border-2 border-green-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    {achievement.category}
                  </span>
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-black text-gray-800 mb-2">{achievement.title}</h4>
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(achievement.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{achievement.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controversies Section */}
      {activeSection === 'controversies' && (
        <div className="space-y-4">
          {careerData.controversies.map(controversy => {
            const impactColor = 
              controversy.impact === 'High' ? 'bg-red-100 text-red-700' :
              controversy.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700';

            return (
              <div key={controversy.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border-2 border-red-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${impactColor}`}>
                        {controversy.impact} Impact
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-gray-800 mb-2">{controversy.title}</h4>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(controversy.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{controversy.description}</p>
                    {controversy.resolution && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-bold text-gray-700 mb-1">Resolution:</p>
                        <p className="text-xs text-gray-600">{controversy.resolution}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}