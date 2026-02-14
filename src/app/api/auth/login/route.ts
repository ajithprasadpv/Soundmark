import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';

const DEMO_USERS = [
  { email: 'admin@soundmark.app', password: 'Admin@123', id: '1', name: 'Ajith Prasad', role: 'owner' as const, organizationId: '1' },
  { email: 'superadmin@soundmark.app', password: 'Admin@123', id: 'sa-1', name: 'Super Admin', role: 'super_admin' as const, organizationId: 'all' },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    const match = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (match) {
      const user = { id: match.id, email: match.email, name: match.name, role: match.role, organizationId: match.organizationId };
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return NextResponse.json({
        data: {
          user: { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId },
          accessToken,
          refreshToken,
        },
      });
    }

    return NextResponse.json(
      { error: { code: 'AUTH_ERROR', message: 'Invalid email or password' } },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Login failed' } },
      { status: 500 }
    );
  }
}
