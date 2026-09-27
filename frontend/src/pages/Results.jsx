import { useLocation, Link, Navigate } from 'react-router-dom';
import {
  Activity, Stethoscope, ArrowLeft, ExternalLink, AlertTriangle, Shield, Pill, Utensils, Info,
  Siren, MapPin, RotateCcw, Printer, CheckCircle2, HelpCircle,
} from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const confidenceBand = (score) => {
  if (score >= 70) return { label: 'High match', tone: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' };
  if (score >= 40) return { label: 'Moderate match', tone: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' };
  return { label: 'Low match', tone: 'bg-rose-100 text-rose-800', bar: 'bg-rose-500' };
};

const BAR_COLORS = ['bg-primary-600', 'bg-primary-400', 'bg-slate-400'];

const ProfileList = ({ icon: Icon, title, items, accent, empty }) => (
  <section className="space-y-3">
    <h3 className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide">
      <Icon className={`w-4 h-4 mr-2 ${accent}`} aria-hidden="true" />
      {title}
    </h3>
    {items?.length ? (
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start text-slate-600 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className={`mr-2 ${accent}`} aria-hidden="true">•</span>
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-slate-400">{empty}</p>
    )}
  </section>
);

const specialistLinks = (specialist) => {
  // "Hepatologist/Gastroenterologist" -> search for the first specialty.
  const primary = specialist.split('/')[0].trim();
  const q = encodeURIComponent(primary);
  const slug = primary.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return [
    { name: 'Practo', href: `https://www.practo.com/search/doctors?results_type=doctor&q=${q}`, icon: ExternalLink },
    { name: 'Apollo 24|7', href: `https://www.apollo247.com/specialties/${slug}`, icon: ExternalLink },
    { name: `Find a ${primary} nearby`, href: `https://www.google.com/maps/search/${q}+near+me`, icon: MapPin },
  ];
};

const Results = () => {
  useDocumentTitle('Results | HealthAI');
  const location = useLocation();
  const data = location.state?.result;
  const symptoms = location.state?.symptoms || [];

  if (!data) {
    return <Navigate to="/predict" replace />;
  }

  const {
    final_prediction, confidence, top_3 = [], model_predictions = {}, doctor_recommendation,
    disease_details, unrecognized_symptoms = [], urgent,
  } = data;
  const band = confidenceBand(confidence);
  const modelVotes = Object.values(model_predictions);
  const agreeing = modelVotes.filter(p => p === final_prediction).length;
  const urgentAlternatives = top_3.slice(1).filter(t => t.urgent).map(t => t.disease);
  const hasProfile = disease_details && disease_details.description && disease_details.description !== 'Information not available.';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to="/predict" className="inline-flex items-center text-slate-500 hover:text-primary-600 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back to Symptom Checker
        </Link>
        <button onClick={() => window.print()} className="hidden sm:inline-flex items-center text-sm text-slate-500 hover:text-primary-600">
          <Printer className="w-4 h-4 mr-1.5" aria-hidden="true" />
          Print / save as PDF
        </button>
      </div>

      {urgent && (
        <div role="alert" className="mb-6 rounded-2xl bg-red-600 text-white p-5 sm:p-6 flex items-start shadow-sm">
          <Siren className="w-7 h-7 mr-4 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-bold">This may need urgent medical attention</h2>
            <p className="text-red-50 mt-1 text-sm sm:text-base">
              {final_prediction} can be serious. If symptoms are severe or getting worse, call your local emergency
              number (112 in India) or go to the nearest hospital now. Do not wait for an appointment.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primary result */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-8 text-white text-center">
              <p className="text-xs font-semibold text-primary-100 uppercase tracking-widest mb-2">Most likely condition</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{final_prediction}</h1>
              <div className="flex flex-wrap justify-center items-center gap-2">
                <span className="inline-flex items-center bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium">
                  Confidence <span className="ml-1.5 font-bold">{confidence}%</span>
                </span>
                <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${band.tone}`}>{band.label}</span>
              </div>
            </div>

            {confidence < 40 && (
              <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-start text-sm text-amber-900">
                <HelpCircle className="w-5 h-5 text-amber-600 mr-3 shrink-0" aria-hidden="true" />
                <p>
                  Your symptoms fit several conditions about equally well, so treat the list below as possibilities
                  rather than an answer. Adding more specific symptoms usually sharpens the result.
                </p>
              </div>
            )}
            {urgentAlternatives.length > 0 && !urgent && (
              <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-start text-sm text-red-900">
                <Siren className="w-5 h-5 text-red-600 mr-3 shrink-0" aria-hidden="true" />
                <p>
                  <strong>{urgentAlternatives.join(' and ')}</strong> {urgentAlternatives.length > 1 ? 'are' : 'is'} also
                  possible and can be serious. Seek prompt care if symptoms are severe.
                </p>
              </div>
            )}
            <div className="px-6 py-4 bg-slate-50 flex items-start text-sm text-slate-600">
              <AlertTriangle className="w-5 h-5 text-slate-400 mr-3 shrink-0" aria-hidden="true" />
              <p>
                This is a machine-learning estimate, not a diagnosis. Always consult a qualified healthcare provider.
              </p>
            </div>
          </div>

          {/* Top 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Possible conditions</h2>
            <p className="text-sm text-slate-500 mb-5">
              In testing, the correct condition was among these three about 98% of the time.
            </p>
            <ol className="space-y-4">
              {top_3.map((item, idx) => (
                <li key={item.disease}>
                  <div className="flex justify-between items-baseline mb-1.5 gap-4">
                    <span className="font-medium text-slate-800">
                      <span className="text-slate-400 mr-2">{idx + 1}.</span>
                      {item.disease}
                      {item.urgent && (
                        <span className="ml-2 align-middle text-[11px] font-semibold uppercase tracking-wide text-red-700 bg-red-50 border border-red-100 rounded px-1.5 py-0.5">
                          Urgent
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-slate-600 tabular-nums">{item.confidence}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden" role="presentation">
                    <div className={`h-full rounded-full ${BAR_COLORS[idx] || 'bg-slate-300'}`} style={{ width: `${Math.max(item.confidence, 1)}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Disease profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center bg-slate-50">
              <Info className="w-6 h-6 text-primary-600 mr-3" aria-hidden="true" />
              <h2 className="text-xl font-bold text-slate-800">About {final_prediction}</h2>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-slate-700 leading-relaxed">
                {hasProfile ? disease_details.description : 'A detailed description is not available for this condition.'}
              </p>
              {hasProfile && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileList icon={Pill} title="Common treatments" items={disease_details.medications} accent="text-indigo-500" empty="No treatments listed." />
                    <ProfileList icon={Shield} title="Precautions" items={disease_details.precautions} accent="text-rose-500" empty="No precautions listed." />
                    <ProfileList icon={Utensils} title="Diet" items={disease_details.diets} accent="text-emerald-500" empty="No diet advice listed." />
                    <ProfileList icon={Activity} title="Lifestyle & activity" items={disease_details.workouts} accent="text-sky-500" empty="No activity advice listed." />
                  </div>
                  <p className="text-xs text-slate-500 border-t border-slate-100 pt-4">
                    Treatments are general categories for reference only. Never start, stop or change medication
                    without advice from a doctor or pharmacist.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {doctor_recommendation && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center text-slate-500 text-sm font-semibold mb-3">
                <Stethoscope className="w-4 h-4 mr-2" aria-hidden="true" />
                Recommended specialist
              </div>
              <div className="text-2xl font-bold text-primary-700 mb-2">{doctor_recommendation.specialist}</div>
              <p className="text-sm text-slate-600 mb-5">{doctor_recommendation.reason}</p>
              <div className="space-y-2 print:hidden">
                {specialistLinks(doctor_recommendation.specialist).map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/40 transition-colors group text-sm"
                  >
                    <span className="font-semibold text-slate-700 group-hover:text-primary-700">{name}</span>
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary-600" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {symptoms.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-md font-bold text-slate-800 mb-3">Symptoms you reported</h2>
              <div className="flex flex-wrap gap-2">
                {symptoms.map(s => (
                  <span key={s} className="text-sm bg-slate-100 text-slate-700 rounded-full px-3 py-1">{s}</span>
                ))}
              </div>
              {unrecognized_symptoms.length > 0 && (
                <p className="mt-3 text-xs text-amber-700">
                  Not recognised and ignored: {unrecognized_symptoms.join(', ')}
                </p>
              )}
            </div>
          )}

          {modelVotes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-md font-bold text-slate-800 mb-1">Individual model outputs</h2>
              <p className="text-sm text-slate-500 mb-4">
                {agreeing} of {modelVotes.length} models agree with the final result.
              </p>
              <ul className="space-y-3">
                {Object.entries(model_predictions).map(([model, pred]) => (
                  <li key={model} className="flex justify-between items-start gap-3 text-sm">
                    <span className="text-slate-500">{model}</span>
                    <span className={`font-medium text-right flex items-center ${pred === final_prediction ? 'text-slate-800' : 'text-slate-500'}`}>
                      {pred === final_prediction && <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" aria-label="agrees" />}
                      {pred}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link to="/predict" className="btn-primary w-full py-3 print:hidden">
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
            Start a new check
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
