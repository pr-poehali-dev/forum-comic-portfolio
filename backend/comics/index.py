import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Comics management API - create, read, update comics and pages
    Args: event with httpMethod (GET/POST/PUT), queryStringParameters, body
          context with request_id
    Returns: HTTP response with comics data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
        comic_id = params.get('id')
        user_id = params.get('user_id')
        
        if comic_id:
            cursor.execute("""
                SELECT c.*, u.username, u.display_name, u.avatar_url,
                       COALESCE(AVG(r.rating), 0) as avg_rating,
                       COUNT(DISTINCT l.id) as likes_count,
                       COUNT(DISTINCT cm.id) as comments_count
                FROM comics c
                JOIN users u ON c.user_id = u.id
                LEFT JOIN ratings r ON c.id = r.comic_id
                LEFT JOIN likes l ON c.id = l.comic_id
                LEFT JOIN comments cm ON c.id = cm.comic_id
                WHERE c.id = %s
                GROUP BY c.id, u.id
            """, (comic_id,))
            comic = cursor.fetchone()
            
            if not comic:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Comic not found'}),
                    'isBase64Encoded': False
                }
            
            comic = dict(comic)
            comic['created_at'] = comic['created_at'].isoformat()
            comic['updated_at'] = comic['updated_at'].isoformat()
            comic['avg_rating'] = float(comic['avg_rating'])
            
            cursor.execute(
                "SELECT id, page_number, image_url, caption FROM comic_pages WHERE comic_id = %s ORDER BY page_number",
                (comic_id,)
            )
            pages = [dict(page) for page in cursor.fetchall()]
            for page in pages:
                page['created_at'] = page.get('created_at').isoformat() if page.get('created_at') else None
            
            comic['pages'] = pages
            
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'comic': comic}),
                'isBase64Encoded': False
            }
        
        query = """
            SELECT c.*, u.username, u.display_name, u.avatar_url,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT l.id) as likes_count
            FROM comics c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN ratings r ON c.id = r.comic_id
            LEFT JOIN likes l ON c.id = l.comic_id
        """
        
        if user_id:
            query += " WHERE c.user_id = %s"
            cursor.execute(query + " GROUP BY c.id, u.id ORDER BY c.created_at DESC", (user_id,))
        else:
            cursor.execute(query + " GROUP BY c.id, u.id ORDER BY c.created_at DESC")
        
        comics = [dict(comic) for comic in cursor.fetchall()]
        for comic in comics:
            comic['created_at'] = comic['created_at'].isoformat()
            comic['updated_at'] = comic['updated_at'].isoformat()
            comic['avg_rating'] = float(comic['avg_rating'])
        
        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'comics': comics}),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        title = body_data.get('title', '').strip()
        description = body_data.get('description', '')
        genre = body_data.get('genre', '')
        cover_url = body_data.get('cover_url', '')
        pages = body_data.get('pages', [])
        
        if not user_id or not title:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id and title required'}),
                'isBase64Encoded': False
            }
        
        cursor.execute(
            "INSERT INTO comics (user_id, title, description, genre, cover_url) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (user_id, title, description, genre, cover_url)
        )
        comic_id = cursor.fetchone()['id']
        
        for page in pages:
            cursor.execute(
                "INSERT INTO comic_pages (comic_id, page_number, image_url, caption) VALUES (%s, %s, %s, %s)",
                (comic_id, page['page_number'], page['image_url'], page.get('caption', ''))
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'comic_id': comic_id, 'message': 'Comic created'}),
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
