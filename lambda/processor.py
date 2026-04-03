import json
import boto3
import uuid
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

BUCKET_NAME = "cloud-analytics-events-rohit123"
TABLE_NAME  = "analytics-metrics"
table       = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    """
    Triggered by SQS. Event contains a list of records.
    """
    for record in event['Records']:
        body = json.loads(record['body'])
        
        user_id = body.get("user_id", "unknown")
        
        # 1) Store raw event to S3 Data Lake
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=f"{uuid.uuid4()}.json",
            Body=json.dumps(body)
        )
        
        # 2) Increment aggregated real-time DynamoDB table
        time_bucket = datetime.utcnow().strftime("%Y-%m-%d-%H:%M")
        
        table.update_item(
            Key={'time_bucket': time_bucket},
            UpdateExpression="""
                SET #u = list_append(if_not_exists(#u, :empty), :u)
                ADD total_events :inc
            """,
            ExpressionAttributeNames={
                "#u": "users"
            },
            ExpressionAttributeValues={
                ':u': [user_id],
                ':empty': [],
                ':inc': 1
            }
        )

    # Broadcast new metrics to WebSocket clients
    apigw = boto3.client(
        "apigatewaymanagementapi",
        endpoint_url="https://<API_ID>.execute-api.ap-south-1.amazonaws.com/prod"
    )
    conn_table = dynamodb.Table('ws-connections')
    
    # Compute metrics like the GET api does
    response = table.scan()
    items = response.get("Items", [])
    items_sorted = sorted(items, key=lambda x: x.get("time_bucket", ""))
    records = []
    for item in items_sorted:
        users = item.get("users", [])
        records.append({
            "time_bucket": item["time_bucket"],
            "total_events": int(item.get("total_events", 0)),
            "active_users": len(set(users))
        })
    total_events = sum(r["total_events"] for r in records)
    total_users = len(set(u for item in items_sorted for u in item.get("users", [])))

    payload = {
        "type": "metrics_update",
        "payload": {
            "total_events": total_events,
            "active_users": total_users,
            "records": records
        }
    }

    connections = conn_table.scan().get('Items', [])
    for conn in connections:
        try:
            apigw.post_to_connection(
                ConnectionId=conn['connectionId'],
                Data=json.dumps(payload)
            )
        except Exception:
            conn_table.delete_item(Key={'connectionId': conn['connectionId']})

    return {"statusCode": 200, "body": "Processed"}
