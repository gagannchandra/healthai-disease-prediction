import React from 'react';
import { GitBranch, Users, Award, Code } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
              <h3 className="font-semibold text-slate-800 flex items-center mb-3">
                <Code className="w-5 h-5 mr-2 text-primary-600" />
                Technology Stack
              </h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li><strong className="text-slate-700">Frontend:</strong> React.js, Tailwind CSS, Recharts</li>
                <li><strong className="text-slate-700">Backend:</strong> FastAPI, Python</li>
                <li><strong className="text-slate-700">Machine Learning:</strong> Scikit-Learn, Pandas, NumPy</li>
                <li><strong className="text-slate-700">Storage:</strong> LocalStorage / JSON</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center mb-3">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Key Features
              </h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Multi-model Disease Prediction</li>
                <li>• Intelligent Doctor Recommendation</li>
                <li>• Voice Input for Symptoms</li>
                <li>• AI Health Assistant Chatbot</li>
                <li>• Prediction History Tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-500 mb-4">Developed as a Final Year B.Tech Project</p>
        <a 
          href="https://github.com/gagannchandra/disease-prediction-system.git" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 shadow-sm text-base font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <GitBranch className="w-5 h-5 mr-2" />
          View Source Code on GitHub
        </a>
      </div>
    </div>
  );
};

export default About;
