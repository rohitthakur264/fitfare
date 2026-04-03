import json
import boto3
import uuid
from datetime import datetime
from decimal import Decimal

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

BUCKET_NAME = "cloud-analytics-events-rohit123"
TABLE_NAME  = "analytics-metrics"
table       = dynamodb.Table(TABLE_NAME)


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)


def lambda_handler(event, context):

    method = event.get("requestContext", {}).get("http", {}).get("method")

    # ──────────────────────────────────────────
    # POST → Ingest Event
    # ──────────────────────────────────────────
    if method == "POST":
        body    = json.loads(event['body'])
        user_id = body.get("user_id", "unknown")

        kinesis = boto3.client('kinesis')

        # Push to real-time stream instead of direct DB writing
        kinesis.put_record(
            StreamName='analytics-stream',
            Data=json.dumps(body),
            PartitionKey=user_id
        )

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Event processed'})
        }

    # ──────────────────────────────────────────
    # GET → Fetch Metrics
    # ──────────────────────────────────────────
    elif method == "GET":

        response = table.scan()
        items    = response.get("Items", [])

        # Sort by time bucket ascending
        items_sorted = sorted(items, key=lambda x: x.get("time_bucket", ""))

        records = []
        for item in items_sorted:
            users        = item.get("users", [])
            unique_users = len(set(users))
            records.append({
                "time_bucket":   item["time_bucket"],
                "total_events":  int(item.get("total_events", 0)),
                "active_users":  unique_users
            })

        total_events = sum(r["total_events"] for r in records)
        total_users  = len(set(u for item in items_sorted for u in item.get("users", [])))
        last_event   = records[-1]["time_bucket"] if records else None

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                "total_events": total_events,
                "active_users": total_users,
                "last_event":   last_event,
                "records":      records
            }, cls=DecimalEncoder)
        }

    return {
        'statusCode': 400,
        'body': json.dumps({'message': 'Invalid request method'})
    }