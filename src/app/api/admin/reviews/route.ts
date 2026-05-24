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
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch reviews.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalizeReviewRating(body: Record<string, any>) {
  return Number(body?.rating ?? body?.stars ?? 5);
}

async function insertReviewWithFallback(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, any>) {
  const attempts = [
    payload,
    Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'stars')),
  ];

  for (const attempt of attempts) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([attempt])
      .select('*')
      .single();

    if (!error) {
      return { data, error: null };
    }

    if (!attempt.stars || !error.message.includes('stars')) {
      return { data: null, error };
    }
  }

  return { data: null, error: new Error('Unable to save review.') };
}

async function updateReviewWithFallback(
  supabase: ReturnType<typeof getSupabaseClient>,
  id: string | number,
  payload: Record<string, any>
) {
  const attempts = [
    payload,
    Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'stars')),
  ];

  for (const attempt of attempts) {
    const { data, error } = await supabase
      .from('reviews')
      .update(attempt)
      .eq('id', id)
      .select('*')
      .single();

    if (!error) {
      return { data, error: null };
    }

    if (!attempt.stars || !error.message.includes('stars')) {
      return { data: null, error };
    }
  }

  return { data: null, error: new Error('Unable to update review.') };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, comment, rating, stars, approved = true } = body ?? {};

    if (!name || !comment) {
      return NextResponse.json({ error: 'Name and comment are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const normalizedRating = normalizeReviewRating(body);
    const payload = {
      name,
      comment,
      rating: normalizedRating,
      stars: normalizedRating,
      approved,
    };

    const result = await insertReviewWithFallback(supabase, payload);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ review: result.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create review.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body ?? {};

    if (!id) {
      return NextResponse.json({ error: 'Missing review id.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const updatePayload: {
      name?: string;
      comment?: string;
      rating?: number;
      stars?: number;
      approved?: boolean;
    } = {};

    if (typeof updates.name === 'string' && updates.name.trim()) {
      updatePayload.name = updates.name;
    }
    if (typeof updates.comment === 'string' && updates.comment.trim()) {
      updatePayload.comment = updates.comment;
    }
    if (updates.rating !== undefined || updates.stars !== undefined) {
      const normalizedRating = normalizeReviewRating(updates);
      updatePayload.rating = normalizedRating;
      updatePayload.stars = normalizedRating;
    }
    if (updates.approved !== undefined) {
      updatePayload.approved = Boolean(updates.approved);
    }

    const result = await updateReviewWithFallback(supabase, id, updatePayload);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ review: result.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update review.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body ?? {};

    if (!id) {
      return NextResponse.json({ error: 'Missing review id.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete review.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
