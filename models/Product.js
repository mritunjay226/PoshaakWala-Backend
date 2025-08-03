import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    
    // 🔁 Changed category from string to array
    category: [String],

    // 🆕 New fields
    
    brand: { type: String },
    type: { type: String },
    productLinks: [String],
    images: [
      {
        url: String,
        tag: {
          type: String,
          enum: ['primary', 'secondary', 'extra'],
          default: 'extra',
        },
      },
    ],

    tags: [String],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
