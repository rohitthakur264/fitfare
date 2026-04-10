import http from 'k6/http';

export default function () {
  http.post('https://z2b1uh7ffb.execute-api.ap-south-1.amazonaws.com/prod/event', JSON.stringify({
    user_id: "test",
    event: "page_view"
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'mysecrettoken123'
    },
  });
}
