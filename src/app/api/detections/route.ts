import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Detection from '@/models/Detection';

export const dynamic = 'force-dynamic';
// GET /api/detections — List all detections
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const verified = searchParams.get('verified');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: Record<string, unknown> = {};

    if (personId) {
      query.personId = personId;
    }

    if (verified !== null && verified !== undefined) {
      query.verified = verified === 'true';
    }

    const skip = (page - 1) * limit;

    const [detections, total] = await Promise.all([
      Detection.find(query)
        .populate('personId', 'name age gender photoUrl status')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Detection.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: detections,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching detections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch detections' },
      { status: 500 }
    );
  }
}

// POST /api/detections — Create a new detection record
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { personId, confidenceScore, capturedImage, cameraSource } = body;

    if (!personId || confidenceScore === undefined || !capturedImage) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: personId, confidenceScore, capturedImage' },
        { status: 400 }
      );
    }

    if (typeof confidenceScore !== 'number' || confidenceScore < 0 || confidenceScore > 1) {
      return NextResponse.json(
        { success: false, error: 'Confidence score must be between 0 and 1' },
        { status: 400 }
      );
    }

    const detection = await Detection.create({
      personId,
      confidenceScore,
      capturedImage,
      cameraSource: cameraSource || 'browser-camera',
      timestamp: new Date(),
    });

    const populated = await Detection.findById(detection._id)
      .populate('personId', 'name age gender photoUrl status')
      .lean();

    return NextResponse.json(
      { success: true, data: populated, message: 'Detection recorded successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating detection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record detection' },
      { status: 500 }
    );
  }
}
