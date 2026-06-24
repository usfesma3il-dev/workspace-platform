import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { roomName, endDate } = await request.json()

  const apiKey = process.env.WHEREBY_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Whereby API key not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch('https://api.whereby.dev/v1/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endDate: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        fields: ['hostRoomUrl'],
        roomNamePrefix: roomName,
        roomMode: 'group',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Whereby API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create Whereby room', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      roomUrl: data.roomUrl,
      hostRoomUrl: data.hostRoomUrl,
      roomName: data.roomName,
      meetingId: data.meetingId,
    })
  } catch (error) {
    console.error('Error creating Whereby room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
