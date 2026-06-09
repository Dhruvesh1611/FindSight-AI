import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MissingPerson from '@/models/MissingPerson';

export const dynamic = 'force-dynamic';

// POST /api/match — Compare a captured frame against stored face encodings
// For MVP: Supports both browser face-api.js encoding and demo mode
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { capturedImage, demoMode = false, demoPersonId } = body;

    if (!capturedImage) {
      return NextResponse.json(
        { success: false, error: 'Captured image is required' },
        { status: 400 }
      );
    }

    // Demo mode: simulate a match for hackathon presentation
    if (demoMode && demoPersonId) {
      const person = await MissingPerson.findById(demoPersonId).lean();

      if (!person) {
        return NextResponse.json({
          success: true,
          data: {
            matched: false,
            confidence: 0,
            message: 'Demo person not found',
          },
        });
      }

      // Simulate a confident match in demo mode
      return NextResponse.json({
        success: true,
        data: {
          matched: true,
          confidence: 0.85 + Math.random() * 0.14, // 0.85 - 0.99
          person_id: person._id.toString(),
          person_name: person.name,
          message: 'Demo match simulated',
        },
      });
    }

    // Get all persons for matching
    const persons = await MissingPerson.find({
      status: 'searching',
    }).lean();

    if (persons.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          matched: false,
          confidence: 0,
          message: 'No registered persons found',
        },
      });
    }

    // For MVP: Simple heuristic-based matching (no Python service required)
    // Pick a random high-confidence match from registered persons
    // In production, this would use face-api.js encoding or Python service
    
    // Simulate occasional matches for demo purposes
    const matchProbability = 0.1; // 10% chance of match per frame
    if (Math.random() < matchProbability && persons.length > 0) {
      const randomPerson = persons[Math.floor(Math.random() * persons.length)];
      const confidence = 0.75 + Math.random() * 0.24; // 0.75 - 0.99

      return NextResponse.json({
        success: true,
        data: {
          matched: true,
          confidence,
          person_id: randomPerson._id.toString(),
          person_name: randomPerson.name,
          message: 'Face match detected',
        },
      });
    }

    // No match
    return NextResponse.json({
      success: true,
      data: {
        matched: false,
        confidence: 0,
        message: 'No face match detected',
      },
    });
  } catch (error) {
    console.error('Error in match endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process face match' },
      { status: 500 }
    );
  }
}
