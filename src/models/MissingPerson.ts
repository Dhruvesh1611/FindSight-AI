import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMissingPerson extends Document {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  lastSeenLocation: string;
  photoUrl: string;
  faceEncoding: number[];
  status: 'searching' | 'found' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const MissingPersonSchema = new Schema<IMissingPerson>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age must be positive'],
      max: [150, 'Age must be realistic'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'other'],
    },
    lastSeenLocation: {
      type: String,
      required: [true, 'Last seen location is required'],
      trim: true,
    },
    photoUrl: {
      type: String,
      required: [true, 'Photo is required'],
    },
    faceEncoding: {
      type: [Number],
      default: [],
    },
    status: {
      type: String,
      enum: ['searching', 'found', 'closed'],
      default: 'searching',
    },
  },
  {
    timestamps: true,
  }
);

const MissingPerson: Model<IMissingPerson> =
  mongoose.models.MissingPerson || mongoose.model<IMissingPerson>('MissingPerson', MissingPersonSchema);

export default MissingPerson;
