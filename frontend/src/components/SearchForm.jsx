import { useState } from 'react';
import { Search, X } from 'lucide-react';
import PropTypes from 'prop-types';

const EMPTY_VALUES = { customerCode: '', customerName: '', port: '', country: '' };

const FIELDS = [
  { key: 'customerCode', label: 'รหัสลูกค้า', placeholder: 'เช่น CUS-0001' },
  { key: 'customerName', label: 'ชื่อลูกค้า', placeholder: 'เช่น ABC Corporation' },
  { key: 'port', label: 'รหัสท่าเรือ / ชื่อท่าเรือ', placeholder: 'เช่น THBKK หรือ Bangkok Port' },
  { key: 'country', label: 'ประเทศ / รหัสประเทศ / เมือง', placeholder: 'เช่น TH, Thailand, กรุงเทพ' },
];

export default function SearchForm({ onSearch, isLoading }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isInvalid = (field) => touched[field] && !values[field].trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(FIELDS.map(({ key }) => [key, true]));
    setTouched(allTouched);
    const allFilled = FIELDS.every(({ key }) => values[key].trim());
    if (!allFilled) return;
    onSearch({ ...values });
  };

  const handleClear = () => {
    setValues(EMPTY_VALUES);
    setTouched({});
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="rounded-2xl border border-[#B0CEEE] bg-white/95 p-6 shadow-[0_18px_55px_rgba(3,78,162,0.1)] ring-1 ring-[#F0F6FD] transition focus-within:border-[#034EA2] focus-within:shadow-[0_20px_60px_rgba(3,78,162,0.15)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label htmlFor={key} className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} <span className="text-red-500">*</span>
              </label>
              <input
                id={key}
                type="text"
                value={values[key]}
                onChange={handleChange(key)}
                onBlur={handleBlur(key)}
                placeholder={placeholder}
                disabled={isLoading}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
                  isInvalid(key)
                    ? 'border-red-400 bg-red-50/30 focus:border-red-400 focus:ring-red-100'
                    : 'border-[#B0CEEE] focus:border-[#034EA2] focus:ring-[#034EA2]/10'
                }`}
              />
              {isInvalid(key) && (
                <p className="mt-1 text-xs text-red-500">กรุณากรอก{label}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-[#B0CEEE] px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-[#EBF2FA] hover:text-slate-800 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            ล้าง
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#034EA2] via-[#154194] to-[#034EA2] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                กำลังค้นหา
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                ค้นหา
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
