import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../../data/invoice_overdue_data.json');

const loadData = () => {
  const raw = readFileSync(DATA_PATH, 'utf-8');
  // Find the closing ] of the first array to handle any trailing garbage
  let depth = 0, end = 0;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '[') depth++;
    else if (raw[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  return JSON.parse(raw.slice(0, end + 1));
};

export const getDashboard = (req, res) => {
  const items = loadData();

  const incoming   = items.filter(i => i.status === 'New');
  const pending    = items.filter(i => i.status === 'Pending' || i.status === 'Overdue');
  const completed  = items.filter(i => i.status === 'Completed');
  const nearDue    = items.filter(i => i.status === 'Critical');

  res.json({
    success: true,
    stats: {
      total:     items.length,
      incoming:  incoming.length,
      pending:   pending.length,
      completed: completed.length,
      nearDue:   nearDue.length,
    },
    items: {
      all:       items,
      incoming,
      pending,
      completed,
      nearDue,
    }
  });
};
