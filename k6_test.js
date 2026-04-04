import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,               // virtual users
  duration: '1m',        // test duration
};

export default function () {
  const payload = JSON.stringify({
    user_id: "user_" + Math.floor(Math.random() * 1000),
    event: "page_view",
    timestamp: new Date().toISOString()
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'mysecrettoken123'
  };

  const res = http.post(
    'https://z2b1uh7ffb.execute-api.ap-south-1.amazonaws.com/prod/event',
    payload,
    { headers: headers }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(0.1);
}
