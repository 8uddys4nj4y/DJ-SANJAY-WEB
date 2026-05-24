import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase server configuration.');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch bookings.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action = 'update', status, admin_notes, ...updates } = body ?? {};

    if (!id) {
      return NextResponse.json({ error: 'Missing booking id.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const updatePayload: Record<string, any> = {};

    if (action === 'decline') {
      updatePayload.status = 'declined';
      updatePayload.admin_notes = admin_notes || 'Declined by admin';
    } else if (action === 'transition') {
      if (!status) {
        return NextResponse.json({ error: 'Missing status.' }, { status: 400 });
      }
      updatePayload.status = status;
      if (admin_notes !== undefined) {
        updatePayload.admin_notes = admin_notes;
      }
    } else {
      if (status !== undefined) {
        updatePayload.status = status;
      }
      if (admin_notes !== undefined) {
        updatePayload.admin_notes = admin_notes;
      }

      const nextFormData = typeof updates.form_data === 'object' && updates.form_data !== null
        ? { ...updates.form_data }
        : {};

      if (updates.name !== undefined) {
        nextFormData.name = updates.name;
      }
      if (updates.email !== undefined) {
        nextFormData.email = updates.email;
      }
      if (updates.phone !== undefined) {
        nextFormData.phone = updates.phone;
      }
      if (updates.address !== undefined) {
        nextFormData.address = updates.address;
      }
      if (updates.profile_image !== undefined) {
        nextFormData.profile_image = updates.profile_image;
      }

      if (Object.keys(nextFormData).length > 0) {
        updatePayload.form_data = nextFormData;
      }

      if (updates.package_type !== undefined) {
        updatePayload.package_type = updates.package_type;
      }
      if (updates.event_date !== undefined) {
        updatePayload.event_date = updates.event_date;
      }
      if (updates.district !== undefined) {
        updatePayload.district = updates.district;
      }
      if (updates.area !== undefined) {
        updatePayload.area = updates.area;
      }
      if (updates.event_type !== undefined) {
        updatePayload.event_type = updates.event_type;
      }
      if (updates.location !== undefined) {
        updatePayload.location = updates.location;
      }
      if (updates.total_amount !== undefined) {
        updatePayload.total_amount = updates.total_amount;
      }
      if (updates.transport_fee !== undefined) {
        updatePayload.transport_fee = updates.transport_fee;
      }
      if (updates.bill_url !== undefined) {
        updatePayload.bill_url = updates.bill_url;
      }
      if (updates.dj_revenue !== undefined) {
        updatePayload.dj_revenue = updates.dj_revenue;
      }
      if (updates.package_revenue !== undefined) {
        updatePayload.package_revenue = updates.package_revenue;
      }
      if (updates.ref_number !== undefined) {
        updatePayload.ref_number = updates.ref_number;
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No updates provided.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update booking.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseClient();

    const payload = {
      user_id: body.userId || null,
      ref_number: body.refNumber || null,
      package_type: body.packageType || 'custom',
      event_date: body.date || null,
      district: body.district || null,
      area: body.area || null,
      event_type: body.eventType || 'Custom Event',
      location: body.location || null,
      status: 'new',
      total_amount: Number(body.totalPrice ?? 0),
      transport_fee: Number(body.transportFee ?? 0),
      dj_revenue: Number(body.djRevenue ?? 2000),
      package_revenue: Number(body.packageRevenue ?? Math.max(0, Number(body.totalPrice ?? 0) - Number(body.djRevenue ?? 2000))),
      form_data: body.formData || {
        name: body.name || null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        profile_image: body.profileImage || null,
      },
    };

    const { data, error } = await supabase.from('bookings').insert([payload]).select('*').single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create custom order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
