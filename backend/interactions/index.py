import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle likes, comments and ratings for comics
    Args: event with httpMethod (GET/POST/DELETE), body with action
          context with request_id
    Returns: HTTP response with interaction result
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        action = params.get('action')
        comic_id = params.get('comic_id')
        
        if action == 'comments' and comic_id:
            cursor.execute("""
                SELECT c.*, u.username, u.display_name, u.avatar_url
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.comic_id = %s
                ORDER BY c.created_at DESC
            """, (comic_id,))
            
            comments = [dict(comment) for comment in cursor.fetchall()]
            for comment in comments:
                comment['created_at'] = comment['created_at'].isoformat()
                comment['updated_at'] = comment['updated_at'].isoformat()
            
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'comments': comments}),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        user_id = body_data.get('user_id')
        comic_id = body_data.get('comic_id')
        
        if not user_id or not comic_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id and comic_id required'}),
                'isBase64Encoded': False
            }
        
        if action == 'like':
            cursor.execute(
                "INSERT INTO likes (user_id, comic_id) VALUES (%s, %s) ON CONFLICT (user_id, comic_id) DO NOTHING",
                (user_id, comic_id)
            )
            conn.commit()
            
            cursor.execute("SELECT COUNT(*) as count FROM likes WHERE comic_id = %s", (comic_id,))
            likes_count = cursor.fetchone()['count']
            
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Liked', 'likes_count': likes_count}),
                'isBase64Encoded': False
            }
        
        elif action == 'comment':
            content = body_data.get('content', '').strip()
            if not content:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'content required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "INSERT INTO comments (user_id, comic_id, content) VALUES (%s, %s, %s) RETURNING id, created_at",
                (user_id, comic_id, content)
            )
            result = cursor.fetchone()
            conn.commit()
            
            cursor.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Comment added',
                    'comment_id': result['id'],
                    'created_at': result['created_at'].isoformat()
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'rate':
            rating = body_data.get('rating')
            if not rating or rating < 1 or rating > 5:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'rating must be between 1 and 5'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """INSERT INTO ratings (user_id, comic_id, rating) 
                   VALUES (%s, %s, %s) 
                   ON CONFLICT (user_id, comic_id) 
                   DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP""",
                (user_id, comic_id, rating)
            )
            conn.commit()
            
            cursor.execute("SELECT AVG(rating) as avg_rating FROM ratings WHERE comic_id = %s", (comic_id,))
            avg_rating = float(cursor.fetchone()['avg_rating'])
            
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Rated', 'avg_rating': avg_rating}),
                'isBase64Encoded': False
            }
    
    elif method == 'DELETE':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        user_id = body_data.get('user_id')
        comic_id = body_data.get('comic_id')
        
        if action == 'unlike' and user_id and comic_id:
            cursor.execute("DELETE FROM likes WHERE user_id = %s AND comic_id = %s", (user_id, comic_id))
            conn.commit()
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Unliked'}),
                'isBase64Encoded': False
            }
    
    cursor.close()
    conn.close()
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid request'}),
        'isBase64Encoded': False
    }
