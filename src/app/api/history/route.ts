import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // In a real application, this would fetch from a database
    // For this demo, we're using client-side storage
    
    return NextResponse.json({
      message: 'History is stored locally. Use client-side storage service.',
      useClientStorage: true
    });
    
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real application, this would save to a database
    // For now, return success and let client handle storage
    
    return NextResponse.json({
      success: true,
      message: 'History management should be handled client-side',
      data: body
    });
    
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'clear') {
      // Clear all history
      return NextResponse.json({
        success: true,
        message: 'History cleared (client-side implementation)'
      });
    }
    
    const itemId = searchParams.get('id');
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'History item deleted (client-side implementation)',
      itemId
    });
    
  } catch (error) {
    console.error('Error deleting history:', error);
    return NextResponse.json(
      { error: 'Failed to delete history' },
      { status: 500 }
    );
  }
}