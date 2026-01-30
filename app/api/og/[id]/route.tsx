import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export const runtime = 'edge';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: animation } = await supabase
      .from('saved_animations')
      .select('title, description, animation_type, frame_count, upvote_count, user_profiles!saved_animations_user_id_fkey(display_name)')
      .eq('id', id)
      .is('hidden_at', null)
      .in('visibility', ['public', 'link_shared'])
      .single();

    if (!animation) {
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: '#1A3D1A',
              color: '#F8F9FA',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>Animation Not Found</div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const authorName = (animation.user_profiles as unknown as { display_name: string | null } | null)?.display_name || 'Anonymous Coach';
    const typeLabel = animation.animation_type.charAt(0).toUpperCase() + animation.animation_type.slice(1);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#1A3D1A',
            color: '#F8F9FA',
            fontFamily: 'Inter, sans-serif',
            padding: 60,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#D97706',
              }}
            >
              🏉 Coaching Animator
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              lineHeight: 1.2,
              marginBottom: 24,
              maxWidth: '90%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {animation.title}
          </div>

          {/* Description */}
          {animation.description && (
            <div
              style={{
                fontSize: 28,
                color: '#F8F9FA',
                opacity: 0.8,
                marginBottom: 40,
                maxWidth: '80%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {animation.description.slice(0, 150)}
              {animation.description.length > 150 ? '...' : ''}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 32,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 24,
                }}
              >
                <span style={{ color: '#D97706' }}>By</span>
                <span>{authorName}</span>
              </div>
              
              <div
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#D97706',
                  fontSize: 20,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {typeLabel}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                fontSize: 22,
                color: '#F8F9FA',
                opacity: 0.8,
              }}
            >
              <span>{animation.frame_count} frames</span>
              <span>•</span>
              <span>👍 {animation.upvote_count}</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#1A3D1A',
            color: '#F8F9FA',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 'bold' }}>Coaching Animator</div>
          <div style={{ fontSize: 24, marginTop: 16, opacity: 0.8 }}>Rugby Play Visualization</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
