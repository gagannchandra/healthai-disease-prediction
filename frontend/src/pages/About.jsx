import React from 'react';
import { GitBranch, Users, Award, Code } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'Gagan Chandra', roll: '2201641520069', github: 'gagannchandra' },
  { name: 'Gaurav', roll: '2201641520072', github: '2k22csai32026-png' },
  { name: 'Anurag Shukla', roll: '2201641520035', github: 'anurag-sys2' },
  { name: 'Devansh Bajpai', roll: '2201641520063', github: 'Devansh121021' },
  { name: 'Abhash Shukla', roll: '2201641520003', github: 'AbhashShukla01' },
];

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const About = () => {
  document.title = "About | HealthAI";
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">About the Project</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Intelligent Disease Prediction and Doctor Recommendation System using Machine Learning
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2 text-primary-600" />
            Project Objective
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6 text-lg">
            This project aims to build a robust system that predicts potential diseases based on user-provided symptoms.
            By utilizing an ensemble of Machine Learning models (Decision Tree, Random Forest, and Naive Bayes),
            we ensure high accuracy and reliability. Additionally, the system provides real-world doctor consultation
            integration to guide users to the right specialists instantly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center mb-4">
                <Code className="w-5 h-5 mr-2 text-primary-600" />
                Technology Stack
              </h3>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li className="flex flex-col"><strong className="text-slate-700 mb-1">Frontend:</strong> React.js, Tailwind CSS, Recharts</li>
                <li className="flex flex-col"><strong className="text-slate-700 mb-1">Backend:</strong> FastAPI, Python</li>
                <li className="flex flex-col"><strong className="text-slate-700 mb-1">Machine Learning:</strong> Scikit-Learn, Pandas, NumPy, XGBoost</li>
                <li className="flex flex-col"><strong className="text-slate-700 mb-1">Storage:</strong> LocalStorage / JSON</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center mb-4">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Key Features
              </h3>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span> Multi-model Disease Prediction</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span> Intelligent Doctor Recommendation</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span> Comprehensive Disease Profiles</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span> Voice Input for Symptoms</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span> AI Health Assistant Chatbot</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Team Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 text-left">
        <div className="p-8 sm:p-10">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Meet the Team</h2>
            <p className="text-lg text-slate-600">Intelligent Disease Prediction System</p>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {TEAM_MEMBERS.map((member, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex items-center space-x-4 hover:shadow-md hover:border-slate-200 transition-all duration-200"
              >
                {member.github ? (
                  <a href={`https://github.com/${member.github}`} target="_blank" rel="noreferrer" className="flex-shrink-0">
                    <img
                      src={`https://github.com/${member.github}.png`}
                      alt={`${member.name} avatar`}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover hover:ring-2 hover:ring-primary-400 transition-all"
                    />
                  </a>
                ) : (
                  <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {getInitials(member.name)}
                  </div>
                )}

                <div>
                  {member.github ? (
                    <a
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg font-bold text-slate-800 leading-tight hover:text-primary-600 transition-colors"
                    >
                      {member.name}
                    </a>
                  ) : (
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{member.name}</h3>
                  )}
                  <p className="text-sm text-slate-500 font-medium mt-1">{member.roll}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Minimal Academic Footer */}
          <div className="pt-6 border-t border-slate-100 text-sm text-slate-500 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-600">B.Tech CSE (AI)</span>
              <span className="mx-2 hidden sm:inline text-slate-300">•</span>
              <span className="block sm:inline mt-1 sm:mt-0">Pranveer Singh Institute of Technology</span>
            </div>
            <div>
              Supervised by: <span className="font-semibold text-slate-600">Mr. Syed Ali Hussain Rizvi (Asst. Professor)</span>
            </div>
          </div>

        </div>
      </div>

      {/* GitHub CTA */}
      <div className="text-center">
        <a
          href="https://github.com/gagannchandra/disease-prediction-system.git"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 shadow-sm text-base font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
        >
          <GitBranch className="w-5 h-5 mr-3" />
          View Source Code on GitHub
        </a>
      </div>
    </div>
  );
};

export default About;
