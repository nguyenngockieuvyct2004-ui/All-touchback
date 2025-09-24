// Kết nối MongoDB (ESM) - cung cấp named export để server.js import { connectDB }
import mongoose from 'mongoose';

/**
 * Kết nối tới MongoDB.
 * @param {string} uri Chuỗi kết nối MongoDB (ví dụ mongodb://localhost:27017/touchback)
 */
export async function connectDB(uri){
  try {
    if(!uri) throw new Error('Missing MongoDB URI');
    await mongoose.connect(uri);
    console.log('> MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

export default connectDB; // optional default nếu muốn dùng import default
