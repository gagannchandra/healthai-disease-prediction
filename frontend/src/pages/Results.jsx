import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Activity, Stethoscope, ArrowLeft, ExternalLink, AlertTriangle, Shield, Pill, Utensils, Info } from 'lucide-react';

const Results = () => {
  const location = useLocation();
  const data = location.state?.result;


  if (!data) {
    return <Navigate to="/predict" />;
  }

  const { final_prediction, confidence, top_3, model_predictions, doctor_recommendation, disease_details } = data;

  // Prepare data for Recharts
  const chartData = top_3.map(item => ({
    name: item.disease,
    confidence: item.confidence
  }));

  const COLORS = ['#0d9488', '#3b82f6', '#94a3b8']; // Teal, Blue, Slate

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link to="/predict" className="inline-flex items-center text-slate-500 hover:text-primary-600 font-medium mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Symptom Checker
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Prediction Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Primary Result Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8 text-white text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-sm font-medium text-primary-100 uppercase tracking-widest mb-2">Primary Diagnosis</h2>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{final_prediction}</h1>
              <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium">
                Confidence Score: <span className="ml-2 font-bold">{confidence}%</span>
              </div>
            </div>
            <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong className="font-semibold">Disclaimer:</strong> This prediction is based on a machine learning model trained on general data and is not a substitute for professional medical advice. Always consult a qualified healthcare provider for an accurate diagnosis.
              </p>
            </div>
          </div>

          {/* Comprehensive Disease Profile */}
          {disease_details && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center bg-slate-50">
                <Info className="w-6 h-6 text-primary-600 mr-3" />
                <h3 className="text-xl font-bold text-slate-800">Comprehensive Disease Profile</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {disease_details.description || "Detailed description not available."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Medications */}
                  <div className="space-y-3">
                    <h4 className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide">
                      <Pill className="w-4 h-4 mr-2 text-indigo-500" />
                      Medications
                    </h4>
                    {disease_details.medications?.length > 0 ? (
                      <ul className="space-y-2">
                        {disease_details.medications.map((item, idx) => (
                          <li key={idx} className="flex items-start text-slate-600 text-sm bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                            <span className="mr-2 text-indigo-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No specific medications listed.</p>
                    )}
                  </div>

                  {/* Diets */}
                  <div className="space-y-3">
                    <h4 className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide">
                      <Utensils className="w-4 h-4 mr-2 text-emerald-500" />
                      Recommended Diet
                    </h4>
                    {disease_details.diets?.length > 0 ? (
                      <ul className="space-y-2">
                        {disease_details.diets.map((item, idx) => (
                          <li key={idx} className="flex items-start text-slate-600 text-sm bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                            <span className="mr-2 text-emerald-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No specific diets listed.</p>
                    )}
                  </div>

                  {/* Precautions */}
                  <div className="space-y-3">
                    <h4 className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide">
                      <Shield className="w-4 h-4 mr-2 text-rose-500" />
                      Precautions
                    </h4>
                    {disease_details.precautions?.length > 0 ? (
                      <ul className="space-y-2">
                        {disease_details.precautions.map((item, idx) => (
                          <li key={idx} className="flex items-start text-slate-600 text-sm bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                            <span className="mr-2 text-rose-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No specific precautions listed.</p>
                    )}
                  </div>

                  {/* Workouts */}
                  <div className="space-y-3">
                    <h4 className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide">
                      <Activity className="w-4 h-4 mr-2 text-sky-500" />
                      Workouts & Activities
                    </h4>
                    {disease_details.workouts?.length > 0 ? (
                      <ul className="space-y-2">
                        {disease_details.workouts.map((item, idx) => (
                          <li key={idx} className="flex items-start text-slate-600 text-sm bg-sky-50/50 p-2 rounded-lg border border-sky-100/50">
                            <span className="mr-2 text-sky-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No specific workouts listed.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Model Comparison Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Top 3 Predictions Analysis</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="confidence" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Doctor Recommendation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Stethoscope className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 relative z-10">Recommended Specialist</h3>
            <div className="relative z-10">
              <div className="text-2xl font-bold text-primary-600 mb-2">{doctor_recommendation.specialist}</div>
              <p className="text-sm text-slate-600 mb-6">{doctor_recommendation.reason}</p>
              
              <div className="space-y-3">
                <a 
                  href={`https://www.practo.com/search/doctors?results_type=doctor&q=${doctor_recommendation.specialist}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all group"
                >
                  <span className="font-semibold text-slate-700 group-hover:text-primary-600">Practo</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary-600" />
                </a>
                <a 
                  href={`https://www.apollo247.com/specialties/${doctor_recommendation.specialist.toLowerCase().replace(/ /g, '-')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all group"
                >
                  <span className="font-semibold text-slate-700 group-hover:text-primary-600">Apollo 24|7</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary-600" />
                </a>
              </div>
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-md font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Individual Model Outputs</h3>
            <div className="space-y-3">
              {Object.entries(model_predictions).map(([model, pred]) => (
                <div key={model} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{model}</span>
                  <span className="font-medium text-slate-800">{pred}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Results;
