import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BrainCircuit, HeartPulse } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const Home = () => {
  document.title = "HealthAI - Intelligent Disease Prediction";
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white pt-20 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 left-0 -mt-20 -ml-20 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Intelligent Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Insights</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Empowering your healthcare decisions with advanced Machine Learning. Predict potential diseases early and connect with the right specialists instantly.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/predict" className="bg-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Start Diagnosis
            </Link>
            <Link to="/about" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-50 transition-colors shadow-sm">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why choose HealthAI?</h2>
            <p className="mt-4 text-slate-600">Built with cutting-edge technology to provide reliable results.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6" />}
              title="Advanced ML Models"
              description="Utilizes Decision Trees, Random Forests, and Naive Bayes algorithms for high accuracy predictions."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Instant Recommendations"
              description="Get immediate suggestions for specialized doctors based on your predicted condition."
            />
            <FeatureCard 
              icon={<HeartPulse className="w-6 h-6" />}
              title="Health Assistant"
              description="Built-in chatbot to answer your basic health queries and provide immediate guidance."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
