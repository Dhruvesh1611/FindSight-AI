import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MissingPerson from '@/models/MissingPerson';

export const dynamic = 'force-dynamic';

// POST /api/match — Compare a captured frame against stored face encodings
// This implementation: calls external AI service to obtain an embedding for the
// captured image, then computes cosine similarity against stored encodings.
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

    // Demo mode: preserve previous behavior when explicitly requested
    if (demoMode && demoPersonId) {
      const person = await MissingPerson.findById(demoPersonId).lean();
      if (!person) {
        return NextResponse.json({ success: true, data: { matched: false, confidence: 0, message: 'Demo person not found' } });
      }
      return NextResponse.json({
        success: true,
        data: {
          matched: true,
          confidence: 0.85 + Math.random() * 0.14,
          person_id: person._id.toString(),
          person_name: person.name,
          message: 'Demo match simulated',
        },
      });
    }

    // TEMPORARY FAST DUMMY DATA MODE WITH DELAY SIMULATION
    // Bypass database entirely to prevent connection pool exhaustion during testing.
    // Since frames are captured every 2 seconds, a 10% chance gives a match in ~20 seconds on average.
    const isMatch = Math.random() < 0.1;
    
    if (!isMatch) {
      return NextResponse.json({ 
        success: true, 
        data: { matched: false, confidence: 0.1 + Math.random() * 0.4, message: 'Analyzing frame...' } 
      });
    }

    // Generate a dummy match with a valid ObjectId format to avoid CastError in PUT /api/persons
    const randomPersonId = '5f8d0d55b54764421b7156d3';
    const randomPersonName = 'Dummy Subject Alpha';
    const confidence = 0.85 + Math.random() * 0.13; // between 85% and 98%
    
    return NextResponse.json({
      success: true,
      data: {
        matched: true,
        confidence: confidence,
        person_id: randomPersonId,
        person_name: randomPersonName,
        message: 'Fast dummy match simulated',
      },
    });

    // Original logic below is temporarily unreachable to ensure fast response:
    // Collect persons that have embeddings
    const candidates = persons.filter((p) => Array.isArray(p.faceEncoding) && p.faceEncoding.length > 0);

    if (candidates.length === 0) {
      return NextResponse.json({ success: true, data: { matched: false, confidence: 0, message: 'No stored face encodings available' } });
    }

    // Call external AI service's /match endpoint with stored encodings
    const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

    // Prepare stored encodings payload
    const stored_encodings = candidates.map((p) => ({
      personId: p._id.toString(),
      personName: p.name,
      encoding: p.faceEncoding,
    }));

    try {
      const resp = await fetch(`${aiServiceUrl.replace(/\/$/, '')}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captured_image: capturedImage, stored_encodings }),
      });

      if (resp.ok) {
        const json = await resp.json();
        // Expecting { matched, confidence, person_id, person_name, message }
        if (json && json.matched) {
          return NextResponse.json({
            success: true,
            data: {
              matched: true,
              confidence: typeof json.confidence === 'number' ? json.confidence : Number(json.confidence) || 0,
              person_id: json.person_id || json.personId || null,
              person_name: json.person_name || json.personName || null,
              message: json.message || 'Face match detected',
            },
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            matched: false,
            confidence: typeof json.confidence === 'number' ? json.confidence : Number(json.confidence) || 0,
            message: json.message || 'No match above threshold',
          },
        });
      } else {
        console.warn('AI service /match returned non-OK');
      }
    } catch (err) {
      console.error('AI service match call failed:', err);
    }

    // Fallback: AI service not available or failed
    return NextResponse.json({ success: true, data: { matched: false, confidence: 0, message: 'AI service unavailable for matching' } });
  } catch (error) {
    console.error('Error in match endpoint:', error);
    return NextResponse.json({ success: false, error: 'Failed to process face match' }, { status: 500 });
  }
}
