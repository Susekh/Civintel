import mongoose, { Schema, Document, Model } from "mongoose";

export interface GeoJSONPoint {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
}

export interface SpotDocument extends Document {
    title: string;
    description: string;
    tags: string[];
    location: GeoJSONPoint;
    gallery : string[];
    createdBy: string;
    createdAt: Date;
}

const GeoJSONPointSchema = new Schema<GeoJSONPoint>({
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: { type: [Number], required: true, validate: (v: number[]) => v.length === 2 },
}, { _id: false });

const SpotSchema = new Schema<SpotDocument>({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    gallery : {type : [String], default : []},
    location: { type: GeoJSONPointSchema, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

SpotSchema.index({ location: "2dsphere" });

export const SpotModel: Model<SpotDocument> = mongoose.models.Spot || mongoose.model<SpotDocument>("Spot", SpotSchema);


