import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#F0F6FD] via-white to-[#F0F6FD] py-12 text-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#034EA2] to-[#3281D1] font-bold text-white">
                🔍
              </div>
              <span className="font-semibold text-slate-900">FindDee</span>
            </div>
            <p className="text-sm text-slate-600">ค้นหา รวบรวม และวิเคราะห์ข้อมูลอย่างง่ายและรวดเร็ว</p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900">ผลิตภัณฑ์</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition hover:text-slate-900">ฟีเจอร์</a></li>
              <li><a href="#" className="transition hover:text-slate-900">ราคา</a></li>
              <li><a href="#" className="transition hover:text-slate-900">ความปลอดภัย</a></li>
              <li><a href="#" className="transition hover:text-slate-900">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900">บริษัท</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition hover:text-slate-900">เกี่ยวกับ</a></li>
              <li><a href="#" className="transition hover:text-slate-900">บล็อก</a></li>
              <li><a href="#" className="transition hover:text-slate-900">ติดต่อ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-slate-900">ทรัพยากร</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition hover:text-slate-900">เอกสาร</a></li>
              <li><a href="#" className="transition hover:text-slate-900">API</a></li>
              <li><a href="#" className="transition hover:text-slate-900">ชุมชน</a></li>
              <li><a href="#" className="transition hover:text-slate-900">สนับสนุน</a></li>
            </ul>
          </div>
        </div>

        <hr className="mb-8 border-[#D9E8F7]" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-slate-600">
            <p>&copy; {currentYear} FindDee. สิทธิ์ทั้งหมดสงวนไว้</p>
            <div className="mt-2 flex gap-4">
              <a href="#" className="transition hover:text-slate-900">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="transition hover:text-slate-900">เงื่อนไขการใช้บริการ</a>
            </div>
          </div>

          <div className="flex gap-4">
            <a href="#" className="transition hover:text-slate-900" title="Twitter"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="transition hover:text-slate-900" title="LinkedIn"><Linkedin className="h-5 w-5" /></a>
            <a href="#" className="transition hover:text-slate-900" title="GitHub"><Github className="h-5 w-5" /></a>
            <a href="mailto:contact@example.com" className="transition hover:text-slate-900" title="Email"><Mail className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

