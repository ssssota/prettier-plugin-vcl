import { format } from "prettier";
import { expect, it } from "vitest";
import { plugin } from "./index.ts";

function formatVcl(source: string) {
  return format(source, {
    plugins: [plugin],
    parser: "fastly-vcl",
  });
}

it("should format ACL declaration", async () => {
  const source = `acl office_ip_ranges {
  "192.0.2.0" / 24;
  !"192.0.2.12" ;
"198.51.100.4";
      "2001:db8:ffff:ffff:ffff:ffff:ffff:ffff";
  }`;
  const expected = `acl office_ip_ranges {
  "192.0.2.0"/24;
  ! "192.0.2.12";
  "198.51.100.4";
  "2001:db8:ffff:ffff:ffff:ffff:ffff:ffff";
}`;
  await expect(formatVcl(source)).resolves.toBe(expected);
});

it("should format Penaltybox/Ratecounter declaration", async () => {
  const source = `penaltybox banned_users {
  }ratecounter requests_per_second {
}`;
  const expected = `penaltybox banned_users {}

ratecounter requests_per_second {}`;
  await expect(formatVcl(source)).resolves.toBe(expected);
});

it("should format table declarations", async () => {
  const source = `table redirects {
    "/old/path" : "https://other.hostname/new/path",
    "/another/path"
    :
    "/new/path"
    }
    table routing_table BACKEND { "a.example.com" : b0,
"b.example.com"
:b1,"c.example.com":b2}`;
  const expected = `table redirects {
  "/old/path": "https://other.hostname/new/path",
  "/another/path": "/new/path",
}

table routing_table BACKEND {
  "a.example.com": b0,
  "b.example.com": b1,
  "c.example.com": b2,
}`;
  await expect(formatVcl(source)).resolves.toBe(expected);
});

it("should format import declaration", async () => {
  const source = `import  std ;`;
  const expected = `import std;`;
  await expect(formatVcl(source)).resolves.toBe(expected);
});

it("should format include declaration", async () => {
  const source = `include  "std/lib.vcl" ;`;
  const expected = `include "std/lib.vcl";`;
  await expect(formatVcl(source)).resolves.toBe(expected);
});

it("should format variable declaration", async () => {
  const source = `backend backend_name {
  .dynamic = true;
.share_key = "YOUR_SERVICE_ID";

.host="storage.googleapis.com";
    .port="443";
.ssl=
true;

 .between_bytes_timeout = 10s;
.connect_timeout =1s;
.
first_byte_timeout = 15s;
. max_connections = 200  ;
}`;
  const expected = `backend backend_name {
  .dynamic = true;
  .share_key = "YOUR_SERVICE_ID";
  .host = "storage.googleapis.com";
  .port = "443";
  .ssl = true;
  .between_bytes_timeout = 10s;
  .connect_timeout = 1s;
  .first_byte_timeout = 15s;
  .max_connections = 200;
}`;
  await expect(formatVcl(source)).resolves.toBe(expected);
});

it("should format subroutine declaration", async () => {
  const source = `sub vcl_recv {
set req.http.X-Forwarded-For = client.ip;
  }`;
  const expected = `sub vcl_recv {
  set req.http.X-Forwarded-For = client.ip;
}`;
  await expect(formatVcl(source)).resolves.toBe(expected);
});
