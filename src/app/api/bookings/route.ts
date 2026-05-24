import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          'Server configuration error: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.',
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload = {
      user_id: body.userId || null,
      ref_number: body.refNumber,
      package_type: body.packageType || null,
      event_date: body.date || null,
      district: body.district || null,
      area: body.area || null,
      event_type: body.eventType || null,
      location: body.location || null,
      status: 'new',
      total_amount: body.totalPrice || null,
      transport_fee: body.transportFee || 0,
      form_data: {
        name: body.name || null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        profile_image: body.profileImage || null,
      },
    };

    const { error } = await supabase.from('bookings').insert([payload]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, refNumber: payload.ref_number });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save booking.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
