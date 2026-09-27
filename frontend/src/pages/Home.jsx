import { Link } from 'react-router-dom';
import { ShieldCheck, BrainCircuit, HeartPulse, Search, ListChecks, Stethoscope, ArrowRight } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
      <Icon className="w-6 h-6" aria-hidden="true" />
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const STATS = [
  { value: '131', label: 'conditions covered' },
  { value: '324', label: 'symptoms understood' },
  { value: '98%', label: 'correct answer in top 3' },
];

const STEPS = [
  { icon: Search, title: 'Add your symptoms', text: 'Search, tap common symptoms, or speak them aloud.' },
  { icon: ListChecks, title: 'Review likely conditions', text: 'See the three best matches with confidence scores and what each one means.' },
  { icon: Stethoscope, title: 'See the right doctor', text: 'Get the relevant specialist and links to book a consultation.' },
];

const Home = () => {
  useDocumentTitle('HealthAI - Intelligent Disease Prediction');
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white pt-16 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob motion-reduce:animate-none" aria-hidden="true"></div>
        <div className="absolute top-0 left-0 -mt-20 -ml-20 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 motion-reduce:animate-none" aria-hidden="true"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Intelligent Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Insights</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe your symptoms and our machine-learning model suggests the most likely conditions and the
            specialist to see, in seconds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/predict" className="inline-flex items-center justify-center bg-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl">
              Check your symptoms
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Link>
            <Link to="/about" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-50 transition-colors shadow-sm">
              Learn more
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/70 backdrop-blur rounded-2xl border border-slate-100 px-3 py-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl sm:text-3xl font-extrabold text-primary-700">{s.value}</dd>
                <dd className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How it works</h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ icon: Icon, title, text }, idx) => (
              <li key={title} className="text-center">
                <div className="relative w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-primary-200 text-primary-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 text-lg mb-1">{title}</h3>
                <p className="text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why choose HealthAI?</h2>
            <p className="mt-4 text-slate-600">Built on a validated machine-learning pipeline with transparent results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={BrainCircuit}
              title="Ensemble ML models"
              description="Logistic Regression, Random Forest and Naive Bayes, evaluated with cross-validation on over 100,000 records."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Specialist guidance"
              description="Every condition maps to the right specialist, with urgent conditions clearly flagged."
            />
            <FeatureCard
              icon={HeartPulse}
              title="Health assistant"
              description="A built-in chat assistant for quick answers to common health questions."
            />
          </div>
          <p className="mt-12 text-center text-sm text-slate-500 max-w-2xl mx-auto">
            HealthAI is an educational project and does not replace professional medical advice. In an emergency,
            call your local emergency number.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
