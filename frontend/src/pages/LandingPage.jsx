import { Search, Database, Zap, BarChart2, ArrowRight, RefreshCw } from 'lucide-react';
import Footer from '../components/Footer';

const features = [
  {
    icon: <Search className="h-6 w-6 text-[#034EA2]" />,
    title: 'ค้นหาอัจฉริยะ',
    desc: 'ค้นหาข้อมูลจากหลายแหล่งพร้อมกัน รองรับภาษาไทยและอังกฤษ',
    action: 'search',
    cta: 'เริ่มค้นหา',
  },
  {
    icon: <RefreshCw className="h-6 w-6 text-emerald-600" />,
    title: 'AI Data Sync',
    desc: 'ซิงก์และอัปเดตข้อมูลจากแหล่งต่างๆ โดยอัตโนมัติ',
    action: 'sync',
    cta: 'จัดการ Sync',
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-violet-600" />,
    title: 'วิเคราะห์ & สรุป',
    desc: 'AI สรุปเนื้อหาเอกสารและแสดงข้อมูลเชิงลึกแบบ real-time',
    action: 'search',
    cta: 'ดูตัวอย่าง',
  },
  {
    icon: <Database className="h-6 w-6 text-orange-500" />,
    title: 'จัดการ Collections',
    desc: 'บันทึกและจัดกลุ่มเอกสารที่สนใจไว้ในคลังส่วนตัวของคุณ',
    action: 'search',
    cta: 'ดู Collections',
  },
];

const stats = [
  { label: 'เอกสารทั้งหมด', value: '10,000+' },
  { label: 'แหล่งข้อมูล', value: '50+' },
  { label: 'ผู้ใช้งาน', value: '500+' },
  { label: 'การค้นหา/วัน', value: '5,000+' },
];

export default function LandingPage({ onNavigate, user, onLogout }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#F0F6FD] via-white to-[#EBF2FA] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#D9E8F7] px-4 py-1.5 text-sm font-medium text-[#034EA2]">
                <Zap className="h-4 w-4" />
                ค้นหาข้อมูลได้ง่ายและรวดเร็ว
              </div>
              <h1 className="mb-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                ยินดีต้อนรับสู่{' '}
                <span className="bg-gradient-to-r from-[#034EA2] to-[#3281D1] bg-clip-text text-transparent">
                  FindDee
                </span>
              </h1>
              <p className="mb-8 text-lg text-slate-500">
                แพลตฟอร์มรวบรวมและค้นหาข้อมูลจากหลายแหล่ง พร้อม AI ช่วยสรุปและวิเคราะห์
                {user && (
                  <span className="block mt-1 font-medium text-[#034EA2]">
                    สวัสดี, {user.name || user.username} 👋
                  </span>
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => onNavigate('search')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#034EA2] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#154194]"
                >
                  <Search className="h-4 w-4" />
                  เริ่มค้นหาข้อมูล
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onNavigate('sync')}
                  className="inline-flex items-center gap-2 rounded-full border border-[#B0CEEE] bg-white px-6 py-3 text-sm font-semibold text-[#034EA2] shadow transition hover:bg-[#F0F6FD]"
                >
                  <RefreshCw className="h-4 w-4" />
                  AI Data Sync
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-[#D9E8F7] bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-black text-[#034EA2]">{s.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-left text-2xl font-bold text-slate-800">
              ฟีเจอร์หลัก
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-[#B0CEEE] hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EBF2FA]">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-800">{f.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                  <button
                    onClick={() => onNavigate(f.action)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#034EA2] transition hover:text-[#154194]"
                  >
                    {f.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#034EA2] to-[#154194] py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">พร้อมเริ่มต้นใช้งานแล้วหรือยัง?</h2>
            <p className="mb-8 text-blue-100">ค้นหาข้อมูลที่ต้องการได้ทันที ง่าย รวดเร็ว และแม่นยำ</p>
            <button
              onClick={() => onNavigate('search')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-[#034EA2] shadow-lg transition hover:bg-[#F0F6FD]"
            >
              <Search className="h-5 w-5" />
              เริ่มค้นหาเลย
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
