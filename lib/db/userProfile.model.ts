import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserProfileDocument extends Document {
    userId: string;
    interests: string[];
    savedSpots : string[],
    isPro : boolean,
    updatedAt: Date;
}

const UserProfileSchema = new Schema<UserProfileDocument>({
    userId: { type: String, required: true, unique: true, index: true },
    interests: { type: [String], default: [] },
    savedSpots: { type: [String], default: [] }, 
    isPro : { type : Boolean, default : false },
    updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps : true
    }
);

UserProfileSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export const UserProfileModel: Model<UserProfileDocument> =
    mongoose.models.UserProfile || mongoose.model<UserProfileDocument>("UserProfile", UserProfileSchema);


