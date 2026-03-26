import { sendSMS, SmsParams } from '@/utils/send-sms';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: SmsParams = await request.json();

    if (
      !body.account ||
      !body.licensekey ||
      !body.phoneNumber ||
      !body.messageText ||
      !body.alfaSender
    ) {
      return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 });
    }

    const result = await sendSMS(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar SMS' },
      { status: 500 }
    );
  }
}
