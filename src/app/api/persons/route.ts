import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MissingPerson from '@/models/MissingPerson';

export const dynamic = 'force-dynamic';
// GET /api/persons — List all missing persons
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: Record<string, unknown> = {};

    if (status && ['searching', 'found', 'closed'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { lastSeenLocation: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [persons, total] = await Promise.all([
      MissingPerson.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MissingPerson.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: persons,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching persons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch missing persons' },
      { status: 500 }
    );
  }
}

// POST /api/persons — Register a new missing person
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const { name, age, gender, lastSeenLocation, photoUrl, faceEncoding } = body;

    // Validation
    if (!name || !age || !gender || !lastSeenLocation || !photoUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, age, gender, lastSeenLocation, photoUrl' },
        { status: 400 }
      );
    }

    if (typeof age !== 'number' || age < 0 || age > 150) {
      return NextResponse.json(
        { success: false, error: 'Age must be a number between 0 and 150' },
        { status: 400 }
      );
    }

    if (!['male', 'female', 'other'].includes(gender)) {
      return NextResponse.json(
        { success: false, error: 'Gender must be male, female, or other' },
        { status: 400 }
      );
    }

    const person = await MissingPerson.create({
      name,
      age,
      gender,
      lastSeenLocation,
      photoUrl,
      faceEncoding: faceEncoding || [],
      status: 'searching',
    });

    return NextResponse.json(
      { success: true, data: person, message: 'Missing person registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register missing person' },
      { status: 500 }
    );
  }
}

// PUT /api/persons — Update a missing person's status or details
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { personId, status } = body;

    if (!personId || !status) {
      return NextResponse.json(
        { success: false, error: 'personId and status are required' },
        { status: 400 }
      );
    }

    if (!['searching', 'found', 'closed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updated = await MissingPerson.findByIdAndUpdate(
      personId,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated, message: 'Person status updated successfully' });
  } catch (error) {
    console.error('Error updating person status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update person status' },
      { status: 500 }
    );
  }
}
