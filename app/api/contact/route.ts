import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

type ContactPayload = {
  name?: string;
  phone?: string;
  comment?: string;
  website?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;

    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const comment = String(body.comment || '').trim();
    const website = String(body.website || '').trim();

    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: 'Вкажіть ім’я.' },
        { status: 400 }
      );
    }

    if (!phone || phone.length < 7) {
      return NextResponse.json(
        { message: 'Вкажіть коректний номер телефону.' },
        { status: 400 }
      );
    }

    if (comment.length > 1000) {
      return NextResponse.json(
        { message: 'Коментар занадто довгий.' },
        { status: 400 }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const contactTo = process.env.CONTACT_TO || smtpUser;

    if (!smtpUser || !smtpPass || !contactTo) {
      return NextResponse.json(
        { message: 'Поштові налаштування не заповнені.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(phone);
    const safeComment = escapeHtml(comment || 'Без коментаря');

    await transporter.sendMail({
      from: `"LDK Partner сайт" <${smtpUser}>`,
      to: contactTo,
      subject: 'Нова заявка на консультацію з сайту',
      replyTo: smtpUser,
      text: [
        'Нова заявка на консультацію з сайту',
        '',
        `Ім’я: ${name}`,
        `Телефон: ${phone}`,
        `Коментар: ${comment || 'Без коментаря'}`,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Нова заявка на консультацію з сайту</h2>
          <p><strong>Ім’я:</strong> ${safeName}</p>
          <p><strong>Телефон:</strong> ${safePhone}</p>
          <p><strong>Коментар:</strong><br />${safeComment}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact form error:', error);

    return NextResponse.json(
      { message: 'Не вдалося надіслати заявку. Спробуйте ще раз.' },
      { status: 500 }
    );
  }
}