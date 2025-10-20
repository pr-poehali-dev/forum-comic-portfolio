import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Public chat room for all users
    Args: event with httpMethod (GET/POST), body with user_id, message
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
        cursor.execute("""
            SELECT cm.*, u.username, u.display_name, u.avatar_url
            FROM chat_messages cm
            JOIN users u ON cm.user_id = u.id
            ORDER BY cm.created_at DESC
            LIMIT 100
        """)
        
        messages = [dict(msg) for msg in cursor.fetchall()]
        for msg in messages:
            msg['created_at'] = msg['created_at'].isoformat()
        
        messages.reverse()
        
        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'messages': messages}),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        message = body_data.get('message', '').strip()
        
        if not user_id or not message:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id and message required'}),
                'isBase64Encoded': False
            }
        
        cursor.execute(
            "INSERT INTO chat_messages (user_id, message) VALUES (%s, %s) RETURNING id, created_at",
            (user_id, message)
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