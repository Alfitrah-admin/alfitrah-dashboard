import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <Link 
          href="/admin/analytics"
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          View Full Analytics
        </Link>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col justify-center transform hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Students</p>
          <p className="text-3xl font-bold text-slate-800">1,248</p>
          <div className="mt-2 flex items-center text-sm text-brand-emerald">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            <span>+12 this month</span>
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col justify-center transform hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Teachers</p>
          <p className="text-3xl font-bold text-slate-800">84</p>
          <div className="mt-2 flex items-center text-sm text-brand-emerald">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            <span>+2 this month</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center transform hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm font-medium text-slate-500 mb-1">Active Reporting Cycle</p>
          <p className="text-3xl font-bold text-slate-800">Oct–Nov</p>
          <div className="mt-2 flex items-center text-sm text-primary">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">In Progress</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center transform hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm font-medium text-slate-500 mb-1">Avg. Attendance</p>
          <p className="text-3xl font-bold text-slate-800">96.4%</p>
          <div className="mt-2 flex items-center text-sm text-brand-emerald">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            <span>+1.2%</span>
          </div>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Trends</h3>
          <div className="h-72 flex items-end justify-between px-2 gap-2">
            {[40, 55, 45, 60, 75, 65, 80, 70, 85, 90].map((height, i) => (
              <div key={i} className="w-full bg-primary/10 rounded-t-md overflow-hidden flex flex-col justify-end group cursor-pointer">
                <div 
                  className="w-full bg-primary/80 group-hover:bg-primary transition-colors duration-300 rounded-t-md" 
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-slate-500">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Grade Distribution</h3>
          <div className="space-y-5 mt-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">A+ (Excellent)</span>
                <span className="text-slate-500 font-medium">35%</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-status-excellent h-2.5 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">A (Very Good)</span>
                <span className="text-slate-500 font-medium">40%</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-status-very-good h-2.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">B (Good)</span>
                <span className="text-slate-500 font-medium">15%</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-brand-muted-teal h-2.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">C (Improving)</span>
                <span className="text-slate-500 font-medium">8%</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-status-improving h-2.5 rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">D (Needs Attention)</span>
                <span className="text-slate-500 font-medium">2%</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-status-needs-attention h-2.5 rounded-full" style={{ width: '2%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Recent Submissions</h3>
          <button className="text-sm text-primary font-medium hover:text-indigo-700 transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100/50 rounded-t-lg">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-lg">Teacher</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Grade/Class</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold rounded-tr-lg text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200/50 hover:bg-white/60 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">Fatima Zahra</td>
                <td className="px-6 py-4 text-slate-600">Quran</td>
                <td className="px-6 py-4 text-slate-600">Grade 3</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-brand-emerald/10 px-2.5 py-0.5 text-xs font-medium text-brand-emerald">Submitted</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-right">10 mins ago</td>
              </tr>
              <tr className="border-b border-slate-200/50 hover:bg-white/60 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">Mohammed Ali</td>
                <td className="px-6 py-4 text-slate-600">Islamic Studies</td>
                <td className="px-6 py-4 text-slate-600">Grade 4</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Draft</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-right">1 hour ago</td>
              </tr>
              <tr className="border-b border-slate-200/50 hover:bg-white/60 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">Aisha Rahman</td>
                <td className="px-6 py-4 text-slate-600">Mathematics</td>
                <td className="px-6 py-4 text-slate-600">Grade 2</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-brand-emerald/10 px-2.5 py-0.5 text-xs font-medium text-brand-emerald">Submitted</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-right">3 hours ago</td>
              </tr>
              <tr className="hover:bg-white/60 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">Omar Farooq</td>
                <td className="px-6 py-4 text-slate-600">English</td>
                <td className="px-6 py-4 text-slate-600">Grade 1: The Pioneers</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Draft</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-right">5 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
