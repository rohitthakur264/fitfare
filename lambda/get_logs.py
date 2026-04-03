import boto3
import time

logs = boto3.client('logs', region_name='ap-south-1')
try:
    response = logs.filter_log_events(
        logGroupName='/aws/lambda/event-ingestion',
        limit=20,
        startTime=int((time.time() - 3600) * 1000)
    )
    for event in response.get('events', []):
        print(event['message'].strip())
except Exception as e:
    print("Error:", e)
