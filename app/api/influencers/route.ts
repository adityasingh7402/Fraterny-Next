import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Influencer, ApiResponse } from '@/lib/types';

// GET /api/influencers - Get all influencers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let query = supabaseAdmin
      .from('influencers')
      .select('*', { count: 'exact' });

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Search by name or email
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Failed to fetch influencers',
          data: []
        } as ApiResponse<Influencer[]>,
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: data || [],
      count: count || 0,
      message: 'Influencers fetched successfully'
    } as ApiResponse<Influencer[]>);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error',
        data: []
      } as ApiResponse<Influencer[]>,
      { status: 500 }
    );
  }
}

// POST /api/influencers - Create new influencer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, bio, affiliate_code, commission_rate, is_india } = body;

    if (!name || !email || !affiliate_code) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Name, email, and affiliate code are required',
          data: null
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('influencers')
      .insert({
        name,
        email,
        phone,
        bio,
        affiliate_code,
        commission_rate: commission_rate || 30.00,
        is_india: is_india || false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        {
          status: 'error',
          message: error.message.includes('duplicate') 
            ? 'Email or affiliate code already exists' 
            : 'Failed to create influencer',
          data: null
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data,
      message: 'Influencer created successfully'
    } as ApiResponse<Influencer>, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        data: null
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}