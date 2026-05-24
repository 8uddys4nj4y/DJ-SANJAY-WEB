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

async function getOrCreateMetricsRow(supabase: ReturnType<typeof getSupabaseClient>) {
  const { data, error } = await supabase
    .from('admin_metrics')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (data) {
    return data;
  }

  const { data: created, error: insertError } = await supabase
    .from('admin_metrics')
    .insert([{ total_booked: 0, total_completed: 0 }])
    .select('*')
    .single();

  if (insertError) {
    throw insertError;
  }

  return created;
}

async function getBookingCounts(supabase: ReturnType<typeof getSupabaseClient>) {
  const { data, error } = await supabase.from('bookings').select('status');

  if (error) {
    throw error;
  }

  return (data ?? []).reduce(
    (acc, booking) => {
      if (booking.status === 'completed') {
        acc.completed += 1;
      }

      if (booking.status === 'new') {
        acc.booked += 1;
      }

      return acc;
    },
    { booked: 0, completed: 0 }
  );
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const metrics = await getOrCreateMetricsRow(supabase);

    return NextResponse.json({ metrics });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch admin metrics.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { totalBooked, totalCompleted, syncFromBookings } = body ?? {};

    const supabase = getSupabaseClient();
    const currentMetrics = await getOrCreateMetricsRow(supabase);

    if (syncFromBookings) {
      const bookingCounts = await getBookingCounts(supabase);
      const { data, error } = await supabase
        .from('admin_metrics')
        .update({
          total_booked: bookingCounts.booked,
          total_completed: bookingCounts.completed,
        })
        .eq('id', currentMetrics.id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ metrics: data });
    }

    const updatePayload: Record<string, any> = {};
    if (totalBooked !== undefined) {
      updatePayload.total_booked = Number(totalBooked);
    }
    if (totalCompleted !== undefined) {
      updatePayload.total_completed = Number(totalCompleted);
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No metrics provided.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('admin_metrics')
      .update(updatePayload)
      .eq('id', currentMetrics.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ metrics: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update admin metrics.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}