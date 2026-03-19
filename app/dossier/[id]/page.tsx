import { getPublicRepairAction } from "../../actions";
import { Wrench, CheckCircle, Clock, ShieldCheck, AlertCircle } from "lucide-react";

export default async function DossierPage({ params }: { params: { id: string } }) {
  // Await the entire params object, which resolves Next.js 15+ routing promises
  const resolvedParams = await Promise.resolve(params);
  const idValue = resolvedParams.id;
  
  const repair = await getPublicRepairAction(Number(idValue));

  if (!repair) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Dossier introuvable</h1>
          <p className="text-slate-500">Le numéro de dossier #{idValue} n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { label: "Prise en charge", active: true },
    { label: "Diagnostic en cours", active: repair.status !== "Demande en ligne" },
    { label: "Réparation en cours", active: ["En cours", "Attente pièce", "Terminée"].includes(repair.status) },
    { label: "Terminée & Prêt", active: repair.status === "Terminée" },
  ];

  return (
    <div className="min-h-[100dvh] bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 mb-2">Repair Pro</h1>
          <p className="font-bold uppercase tracking-widest text-slate-500 text-xs">Suivi de réparation client</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wrench className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">Dossier #{repair.id.toString().slice(-4)}</div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">{repair.brandModel}</h2>
              <p className="text-blue-100/80">{repair.deviceType}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8 p-4 bg-blue-50 text-blue-800 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
              <p className="text-sm font-medium leading-snug">Vos données sont protégées. Identification partielle : <strong className="font-bold">{repair.clientName}</strong></p>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              État de l'intervention
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
               {steps.map((step, idx) => (
                 <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                   <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 ${step.active ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-slate-200 text-slate-400'} shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                     {step.active ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                   </div>
                   <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] md:text-center p-4 rounded-xl shadow-sm border border-slate-100 bg-white">
                     <h4 className={`font-bold ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</h4>
                   </div>
                 </div>
               ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">Défaut signalé par le client</p>
              <p className="text-slate-700 font-medium p-4 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed italic">
                "{repair.issue}"
              </p>
            </div>
            
            <div className="mt-6">
               <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Dossier créé le : {repair.createdAt}</p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 font-medium pb-8 border-b-4 border-indigo-500 rounded-b-xl w-max mx-auto px-4">Pour toute question, contactez-nous au 01 23 45 67 89 ou par email.</p>
      </div>
    </div>
  );
}
