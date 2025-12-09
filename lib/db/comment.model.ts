import mongoose, { Schema, Document, Model } from "mongoose";

export interface CommentDocument extends Document {
    spotId: string;
    userId: string;
    content: string;
    username : string;
    createdAt: Date;
}

const CommentSchema = new Schema<CommentDocument>({
    spotId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    username : {type : String, required : true},
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
});

export const CommentModel: Model<CommentDocument> = mongoose.models.Comment || mongoose.model<CommentDocument>("Comment", CommentSchema);


