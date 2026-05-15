export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-t-4 border-t-brand-emerald transform hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-800">Grade 3</h3>
          <p className="text-sm text-slate-500 mt-1">Quran • 28 Students</p>
          <div className="mt-4 flex justify-end">
            <button className="text-sm font-medium text-brand-emerald hover:underline">View Class</button>
          </div>
        </div>
        <div className="glass-card p-6 border-t-4 border-t-brand-emerald transform hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-800">Grade 3</h3>
          <p className="text-sm text-slate-500 mt-1">Quran • 30 Students</p>
          <div className="mt-4 flex justify-end">
            <button className="text-sm font-medium text-brand-emerald hover:underline">View Class</button>
          </div>
        </div>
        <div className="glass-card p-6 border-t-4 border-t-brand-deep-teal transform hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-800">Grade 4</h3>
          <p className="text-sm text-slate-500 mt-1">Islamic Studies • 25 Students</p>
          <div className="mt-4 flex justify-end">
            <button className="text-sm font-medium text-brand-deep-teal hover:underline">View Class</button>
          </div>
        </div>
      </div>
    </div>
  );
}
