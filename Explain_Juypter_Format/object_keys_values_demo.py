"""
Python version of what src/app/api/demo/firecrawl/route.ts does with the
request body: text arrives, it becomes an object, and we pull values out of it.

A JavaScript object like { url: "..." } is a *dict* in Python.

Run with:  python object_keys_values_demo.py
"""

import json

# ---------------------------------------------------------------------------
# 1. The page side: build an object and turn it into text
#    JS:  JSON.stringify({ url })
# ---------------------------------------------------------------------------
url = "https://example.com"
sent_text = json.dumps({"url": url})

print("1. What travels over the network (always text)")
print("   sent_text =", sent_text, "| type:", type(sent_text).__name__)
print()

# ---------------------------------------------------------------------------
# 2. The route side: turn the text back into an object
#    JS:  const body = await request.json();
# ---------------------------------------------------------------------------
body = json.loads(sent_text)

print("2. After parsing, it's an object (a dict)")
print("   body =", body, "| type:", type(body).__name__)
print()

# ---------------------------------------------------------------------------
# 3. Getting one value out
#    JS:  const { url } = body;     (destructuring)
#    JS:  const url = body.url;     (same thing, written out)
# ---------------------------------------------------------------------------
print("3. Getting the value of one key")

# Square brackets: the Python version of body.url.
# Raises KeyError if the key is missing.
url_value = body["url"]
print('   body["url"]        =', url_value, "| type:", type(url_value).__name__)

# .get(): returns None (or a default) instead of raising when the key is
# missing, like JavaScript giving you undefined.
print('   body.get("url")    =', body.get("url"))
print('   body.get("title")  =', body.get("title"), "  <- key doesn't exist")

# The closest thing Python has to JS destructuring: a match statement
# with a dict pattern (Python 3.10+). It pulls "url" out into a variable.
match body:
    case {"url": matched_url}:
        print("   match {'url': x}   =", matched_url)
print()

# Without destructuring you'd hold the whole dict, not the string:
print("   Compare: the whole body is", type(body).__name__,
      "but body['url'] is", type(body["url"]).__name__)
print()

# ---------------------------------------------------------------------------
# 4. A bigger object, like the JSON the route sends back to the page
#    JS:  Response.json({ title, sourceURL, statusCode, markdown })
# ---------------------------------------------------------------------------
result = {
    "title": "Example Domain",
    "sourceURL": "https://example.com",
    "statusCode": 200,
    "markdown": "# Example Domain\n\nThis domain is for use in documentation examples...",
}

print("4. Keys, values, and both together")

# JS:  Object.keys(result)
print("   keys:  ", list(result.keys()))

# JS:  Object.values(result)
print("   values:", list(result.values()))

# JS:  Object.entries(result)  -> [key, value] pairs
print("   each key, its value, and the value's type:")
for key, value in result.items():
    print(f"     {key:<11} = {value!r:<40.40} | type: {type(value).__name__}")
print()

# Several values at once
# JS:  const { title, statusCode } = result;
title, status_code = result["title"], result["statusCode"]
print("   title =", title, "| statusCode =", status_code)
print()

# ---------------------------------------------------------------------------
# 5. Headers: turn them into a dict, then remove one key
#    JS:  const headers = Object.fromEntries(request.headers);
#         delete headers.cookie;
# ---------------------------------------------------------------------------
header_pairs = [
    ("content-type", "application/json"),
    ("host", "localhost:3000"),
    ("cookie", "__session=secret-token"),
]
headers = dict(header_pairs)  # the Python version of Object.fromEntries

print("5. Headers before and after removing the cookie")
print("   before:", headers)
del headers["cookie"]  # JS: delete headers.cookie
print("   after: ", headers)
print('   "cookie" in headers =', "cookie" in headers)  # JS: "cookie" in headers
