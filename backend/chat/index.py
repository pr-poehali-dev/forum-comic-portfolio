import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User-to-user messaging system for online chat
    Args: event with httpMethod (GET/POST), body with sender_id, receiver_id, content
          context with request_id
    Returns: HTTP response with messages or send confirmation
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        user_id = params.get('user_id')
        other_user_id = params.get('other_user_id')
        
        if not user_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id required'}),
                'isBase64Encoded': False
            }
        
        if other_user_id:
            cursor.execute("""
                SELECT m.*, 
                       s.username as sender_username, s.display_name as sender_display_name, s.avatar_url as sender_avatar,
                       r.username as receiver_username, r.display_name as receiver_display_name, r.avatar_url as receiver_avatar
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                WHERE (m.sender_id = %s AND m.receiver_id = %s) OR (m.sender_id = %s AND m.receiver_id = %s)
                ORDER BY m.created_at ASC
            """, (user_id, other_user_id, other_user_id, user_id))
            
            messages = [dict(msg) for msg in cursor.fetchall()]
            for msg in messages:
                msg['created_at'] = msg['created_at'].isoformat()
            
            cursor.execute(
                "UPDATE messages SET is_read = TRUE WHERE receiver_id = %s AND sender_id = %s AND is_read = FALSE",
                (user_id, other_user_id)
            )
            conn.commit()
            
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': messages}),
                'isBase64Encoded': False
            }
        else:
            cursor.execute("""
                SELECT DISTINCT ON (other_user_id) 
                       other_user_id, other_username, other_display_name, other_avatar, 
                       last_message, last_message_time, unread_count
                FROM (
                    SELECT 
                        CASE WHEN m.sender_id = %s THEN m.receiver_id ELSE m.sender_id END as other_user_id,
                        CASE WHEN m.sender_id = %s THEN r.username ELSE s.username END as other_username,
                        CASE WHEN m.sender_id = %s THEN r.display_name ELSE s.display_name END as other_display_name,
                        CASE WHEN m.sender_id = %s THEN r.avatar_url ELSE s.avatar_url END as other_avatar,
                        m.content as last_message,
                        m.created_at as last_message_time,
                        (SELECT COUNT(*) FROM messages WHERE receiver_id = %s AND sender_id = CASE WHEN m.sender_id = %s THEN m.receiver_id ELSE m.sender_id END AND is_read = FALSE) as unread_count
                    FROM messages m
                    JOIN users s ON m.sender_id = s.id
                    JOIN users r ON m.receiver_id = r.id
                    WHERE m.sender_id = %s OR m.receiver_id = %s
                    ORDER BY m.created_at DESC
                ) as conversations
                ORDER BY other_user_id, last_message_time DESC
            """, (user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id))
            
            conversations = [dict(conv) for conv in cursor.fetchall()]
            for conv in conversations:
                conv['last_message_time'] = conv['last_message_time'].isoformat()
            
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'conversations': conversations}),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        sender_id = body_data.get('sender_id')
        receiver_id = body_data.get('receiver_id')
        content = body_data.get('content', '').strip()
        
        if not sender_id or not receiver_id or not content:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'sender_id, receiver_id and content required'}),
                'isBase64Encoded': False
            }
        
        cursor.execute(
            "INSERT INTO messages (sender_id, receiver_id, content) VALUES (%s, %s, %s) RETURNING id, created_at",
            (sender_id, receiver_id, content)
        )
        result = cursor.fetchone()
        conn.commit()
        
        cursor.close()
        conn.close()
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Message sent',
                'message_id': result['id'],
                'created_at': result['created_at'].isoformat()
            }),
            'isBase64Encoded': False
        }
    
    cursor.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
