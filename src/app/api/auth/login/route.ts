import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';

const DEMO_EMAIL = 'admin@ambienceai.com';
const DEMO_PASSWORD = 'Admin@123';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    // Demo authentication
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const user = { id: '1', email: DEMO_EMAIL, name: 'Alex Morgan', role: 'owner' as const };
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return NextResponse.json({
        data: {
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
          accessToken,
          refreshToken,
        },
      });
    }

    return NextResponse.json(
      { error: { code: 'AUTH_ERROR', message: 'Invalid email or password' } },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Login failed' } },
      { status: 500 }
    );
  }
}
