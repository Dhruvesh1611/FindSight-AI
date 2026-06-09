import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDetection extends Document {
  personId: mongoose.Types.ObjectId;
  confidenceScore: number;
  capturedImage: string;
  timestamp: Date;
  verified: boolean;
  cameraSource: string;
  createdAt: Date;
}

const DetectionSchema = new Schema<IDetection>(
  {
    personId: {
      type: Schema.Types.ObjectId,
      ref: 'MissingPerson',
      required: [true, 'Person ID is required'],
    },
    confidenceScore: {
      type: Number,
      required: [true, 'Confidence score is required'],
      min: 0,
      max: 1,
    },
    capturedImage: {
      type: String,
      required: [true, 'Captured image is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    cameraSource: {
      type: String,
      default: 'browser-camera',
    },
  },
  {
    timestamps: true,
  }
);

DetectionSchema.index({ personId: 1 });
DetectionSchema.index({ timestamp: -1 });

const Detection: Model<IDetection> =
  mongoose.models.Detection || mongoose.model<IDetection>('Detection', DetectionSchema);

export default Detection;
