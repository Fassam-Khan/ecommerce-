import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Media from "@/models/Media";

export async function POST(req) {
    try {
      await connectDB();
  
      const body = await req.json();
  
      console.log("Request body:", body);
  
      const result = await Media.create(body);
  
      return NextResponse.json(
        { success: true, data: result },
        { status: 201 }
      );
    } catch (error) {
      console.error("API ERROR:", error);
  
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
  }

  export async function GET(request){

    const { searchParams } = new URL(request.url);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10) || 10, 1),
      100
    );
    try{
      await connectDB()
      

      const media = await Media.find({}).sort({_id:-1}).limit(limit);

      return NextResponse.json({sucsess: true, data: media})

  
    }catch (error){
      console.log("Error in fetching", error);

      return NextResponse.json({success: false, error: "Failed to fetch data"}, {status: 500})
  
    }
  }