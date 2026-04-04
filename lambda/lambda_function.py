import json
import boto3
import os
import jwt
from decimal import Decimal

# AWS setup
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

BUCKET_NAME = "cloud-analytics-events-rohit123"
TABLE_NAME = "analytics-metrics"
table = dynamodb.Table(TABLE_NAME)
SECRET = "mysecretkey"


# ✅ FIXED CLASS (INDENTED PROPERLY)
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)


def lambda_handler(event, context):

    method = event.get("requestContext", {}).get("http", {}).get("method")
    
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*"
            },
            "body": ""
        }

    # ==========================
    # POST → Send to SQS
    # ==========================
    if method == "POST":
        try:
            # 1. JWT Verification
            headers = event.get("headers", {})
            auth_header = headers.get("authorization", "") or headers.get("Authorization", "")
            
            if not auth_header.startswith("Bearer "):
                return {"statusCode": 401, "body": json.dumps({"message": "Unauthorized"})}
                
            token = auth_header.split(" ")[1]
            jwt.decode(token, SECRET, algorithms=["HS256"])
            
            # Safe parsing
            if isinstance(event.get('body'), str):
                try:
                    body = json.loads(event['body'])
                except:
                    body = {}
            else:
                body = event.get('body', {})
    
            sqs = boto3.client('sqs', region_name='ap-south-1')
            q_url = sqs.get_queue_url(QueueName='analytics-queue')['QueueUrl']
    
            sqs.send_message(
                QueueUrl=q_url,
                MessageBody=json.dumps(body)
            )
    
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*"
                },
                "body": json.dumps({"message": "Event accepted"})
            }
        except Exception as e:
            return {
                "statusCode": 401,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": str(e)})
            }

    # ==========================
    # GET → Fetch Metrics
    # ==========================
    elif method == "GET":

        response = table.scan()
        items = response.get("Items", [])

        items_sorted = sorted(items, key=lambda x: x.get("time_bucket", ""))

        records = []
        for item in items_sorted:
            users = item.get("users", [])
            unique_users = len(set(users))

            records.append({
                "time_bucket": item["time_bucket"],
                "total_events": int(item.get("total_events", 0)),
                "active_users": unique_users
            })

        total_events = sum(r["total_events"] for r in records)
        total_users = len(set(u for item in items_sorted for u in item.get("users", [])))
        last_event = records[-1]["time_bucket"] if records else None

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "total_events": total_events,
                "active_users": total_users,
                "last_event": last_event,
                "records": records
            }, cls=DecimalEncoder)
        }

    # ==========================
    # INVALID METHOD
    # ==========================
    return {
        "statusCode": 400,
        "body": json.dumps({"message": "Invalid request method"})
    }