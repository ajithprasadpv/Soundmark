import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateAccessToken, generateRefreshToken, validatePassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, organization } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required' } },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: passwordValidation.message } },
        { status: 400 }
      );
    }

    const userId = uuidv4();
    const passwordHash = await hashPassword(password);

    const user = {
      id: userId,
      email,
      name,
      role: 'owner' as const,
      status: 'active' as const,
      organizationId: uuidv4(),
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return NextResponse.json({
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } },
      { status: 500 }
    );
  }
}
