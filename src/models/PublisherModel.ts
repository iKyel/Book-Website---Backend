import mongoose from "mongoose";

const PublisherSchema = new mongoose.Schema(
    {
        publisherName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const PublisherModel = mongoose.model('publisher', PublisherSchema);