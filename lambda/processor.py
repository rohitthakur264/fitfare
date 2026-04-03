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

    return {"statusCode": 200, "body": "Processed"}
