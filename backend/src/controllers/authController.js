import jwt from 'jsonwebtoken';

const USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'bank@2026',
    name: 'ผู้ดูแลระบบ',
    role: 'ผู้ดูแลระบบ'
  },
  {
    id: 2,
    username: 'user',
    password: 'bank@2026',
    name: 'ผู้ใช้ทดสอบ',
    role: 'ผู้ใช้งาน'
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'finddee_jwt_secret_2026';
const JWT_EXPIRES_IN = '8h';

export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'กรุณากรอก Username และ Password' });
  }

  const user = USERS.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, error: 'Username หรือ Password ไม่ถูกต้อง' });
  }

  const payload = { id: user.id, username: user.username, name: user.name, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role }
  });
};

export const logout = (req, res) => {
  res.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
};
