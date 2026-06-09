import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MissingPerson from '@/models/MissingPerson';
import Detection from '@/models/Detection';

export const dynamic = 'force-dynamic';
// GET /api/stats — Dashboard statistics
export async function GET() {
  try {
    await dbConnect();

    const [totalPersons, activeSearches, totalDetections, recentDetections] = await Promise.all([
      MissingPerson.countDocuments(),
      MissingPerson.countDocuments({ status: 'searching' }),
      Detection.countDocuments(),
      Detection.find()
        .populate('personId', 'name age gender photoUrl status')
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
    ]);

    // Get detections grouped by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const detectionsByDay = await Detection.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalPersons,
        activeSearches,
        totalDetections,
        recentDetections,
        detectionsByDay,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
