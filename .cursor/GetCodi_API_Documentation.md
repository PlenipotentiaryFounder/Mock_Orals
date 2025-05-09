Cody AI API
1.0
Base URL
https://getcody.ai/api/v1
API for Cody AI

This is version 1.0 of this API documentation. Last update on May 4, 2024.

Authentication
Cody AI API uses API keys for authentication. Visit your API Keys page to retrieve the API key you'll use in your requests.

Your API key is a secret! Do not share it with others or expose it in any client-side code (browsers, apps). Requests must be proxied through your own backend server where your API key can be securely stored.

All API requests should include your API key in an Authorization HTTP header as follows:

Authorization: Bearer API_KEY
Rate Limiting
API Rate Limits are in place to protect Cody AI from API traffic spikes that could put our services at risk. We therefore measure the amount of requests sent to the API in order to throttle these when they surpass the amount allowed. We will respond with '429 Too Many Requests' and the following headers:

Header	Explanation
x-ratelimit-limit	Maximum number of requests allowed per minute.
x-ratelimit-remaining	Number of requests left in the current time.
x-ratelimit-reset	Time when the number of requests will be reset to the maximum limit. Shown as UNIX timestamp.
retry-after	Number of seconds to wait before retrying your request.
You can view your account rate limits on your account API Keys page.

Focus Mode
In Focus Mode, Cody will focus entirely on the documents you've selected for generating responses, rather than pulling data from all documents in your bots' knowledge base. This allows for macro-adjustments to bots' knowledge base. The feature is especially useful for:

Summarization
Rephrasing
Outlining
Review
And much more...
To use Focus mode, you have to specify the document IDs when creating or updating a conversation.

Bots
List Bots
GET
/bots
 Api key
Get all bots

Query parameters
keyword string
Keyword to filter the list of bots to only those that at least partially match the bot name.

Responses
 200
application/json
OK

Hide response attributes
object
data array[object]
Show data attributes
object
meta object
Show meta attribute
object
GET
/bots
curl \
 --request GET 'https://getcody.ai/api/v1/bots' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Response examples (200)
{
  "data": [
    {
      "id": "yiu456ytyUjk",
      "name": "Factual Bot",
      "created_at": 1672578000
    }
  ],
  "meta": {
    "pagination": {
      "count": 42,
      "total": 42,
      "per_page": 42,
      "total_pages": 42,
      "next_page": 42,
      "previous_page": 42
    }
  }
}
Conversations
List Conversations
GET
/conversations
 Api key
Get all conversations

Query parameters
bot_id string
Id of the bot to filter the list of conversations to only those that are using the selected bot.

keyword string
Keyword to filter the list of conversations to only those that at least partially match the conversation name.

includes string
Lists document ids the conversation is focused on.

Value is document_ids.

Responses
 200
application/json
OK

Hide response attributes
object
data array[object]
Show data attributes
object
meta object
Show meta attribute
object
GET
/conversations
curl \
 --request GET 'https://getcody.ai/api/v1/conversations' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Response examples (200)
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "bot_id": "string",
      "created_at": 42
    }
  ],
  "meta": {
    "pagination": {
      "count": 42,
      "total": 42,
      "per_page": 42,
      "total_pages": 42,
      "next_page": 42,
      "previous_page": 42
    }
  }
}
Create Conversation
POST
/conversations
 Api key
Create new conversation

application/json
Body
To use focus mode, add a list of document IDs to limit bot's knowledge base for this conversation.

name string Required
bot_id string Required
document_ids array[string]
Only documents that exist in the folders the bot has access to are allowed. You can give bot access to all folders if you wish to limit documents from your whole knowledge base.

Not more than 1000 elements.

Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
 422
application/json
Request validation failure.

Show response attributes
object
POST
/conversations
curl \
 --request POST 'https://getcody.ai/api/v1/conversations' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"name":"string","bot_id":"string","document_ids":["string"]}'
Request examples
{
  "name": "string",
  "bot_id": "string",
  "document_ids": [
    "string"
  ]
}
Response examples (200)
{
  "data": {
    "id": "string",
    "name": "string",
    "bot_id": "string",
    "created_at": 42
  }
}
Response examples (422)
{
  "errors": {
    "bot_id": [
      "The selected bot id is invalid."
    ]
  },
  "message": "The selected bot id is invalid."
}
Get Conversation
GET
/conversations/{id}
 Api key
Fetch a conversation by its id.

Path parameters
id string Required
Id of the conversation

Query parameters
includes string
Lists document ids the conversation is focused on.

Value is document_ids.

Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
GET
/conversations/{id}
curl \
 --request GET 'https://getcody.ai/api/v1/conversations/{id}' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Response examples (200)
{
  "data": {
    "id": "string",
    "name": "string",
    "bot_id": "string",
    "created_at": 42
  }
}
Update Conversation
POST
/conversations/{id}
 Api key
Update a conversation by its id.

Path parameters
id string Required
Id of the conversation

application/json
Body
To use focus mode, add a list of document IDs to limit bot's knowledge base for this conversation.

name string Required
bot_id string Required
document_ids array[string]
Only documents that exist in the folders the bot has access to are allowed. You can give bot access to all folders if you wish to limit documents from your whole knowledge base.

Not more than 1000 elements.

Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
 422
application/json
Request valiadtion failure.

Show response attributes
object
POST
/conversations/{id}
curl \
 --request POST 'https://getcody.ai/api/v1/conversations/{id}' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"name":"string","bot_id":"string","document_ids":["string"]}'
Request examples
{
  "name": "string",
  "bot_id": "string",
  "document_ids": [
    "string"
  ]
}
Response examples (200)
{
  "data": {
    "id": "string",
    "name": "string",
    "bot_id": "string",
    "created_at": 42
  }
}
Response examples (422)
{
  "errors": {
    "bot_id": [
      "The selected bot id is invalid."
    ]
  },
  "message": "The selected bot id is invalid."
}
Delete Conversation
DELETE
/conversations/{id}
 Api key
Delete a conversation by its id.

Path parameters
id string Required
Id of the conversation

Responses
 200
OK

DELETE
/conversations/{id}
curl \
 --request DELETE 'https://getcody.ai/api/v1/conversations/{id}' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Documents
List Documents
GET
/documents
 Api key
Get all documents

Query parameters
folder_id string
Id of the folder to list documents for.

conversation_id string
Id of the conversation to only list documents the conversation is focused on.

keyword string
Keyword to filter the list to documents that partially match the name.

Responses
 200
application/json
OK

Hide response attributes
object
data array[object]
Show data attributes
object
meta object
Show meta attribute
object
GET
/documents
curl \
 --request GET 'https://getcody.ai/api/v1/documents' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Response examples (200)
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "status": "syncing",
      "content_url": "string",
      "folder_id": "string",
      "created_at": 42
    }
  ],
  "meta": {
    "pagination": {
      "count": 42,
      "total": 42,
      "per_page": 42,
      "total_pages": 42,
      "next_page": 42,
      "previous_page": 42
    }
  }
}
Create Document
POST
/documents
 Api key
Create new document with text or html.

You can use a format like this with explicit start and end to get the best results:

<h2>What do you call a bear with no teeth?</h2>
<p>You'd call it a "gummy bear," just like those chewy, toothless candies that don't bite back.</p>

<h2>Why did the math book look sad?</h2>
<p>The math book seemed down in the dumps because it was overwhelmed by countless problems, equations, and algebraic mysteries.</p>

<h2>What's orange and sounds like a parrot?</h2>
<p>An item that's both orange and mimics a parrot's squawk is a "carrot," although you wouldn't expect vegetables to talk!</p>
application/json
Body


You can send up to 768 KB of text or html in the content field, content larger than that needs to be uploaded as a file.

name string
folder_id string
content string | null
Up to 768 KB of text or html only.

Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
 422
application/json
Request validation failure.

Show response attributes
object
POST
/documents
curl \
 --request POST 'https://getcody.ai/api/v1/documents' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"name":"string","folder_id":"string","content":"string"}'
Request examples
{
  "name": "string",
  "folder_id": "string",
  "content": "string"
}
Response examples (200)
{
  "data": {
    "id": "string",
    "name": "string",
    "status": "syncing",
    "content_url": "string",
    "folder_id": "string",
    "created_at": 42
  }
}
Response examples (422)
{
  "message": "string",
  "errors": {
    "name": [
      "string"
    ],
    "folder_id": [
      "string"
    ],
    "content": [
      "string"
    ]
  }
}
Create Document from File
POST
/documents/file
 Api key
Create a document by uploading a file up to 100 MB in size.



Only these file types are allowed: txt, md, rtf, pdf, ppt, pptx, pptm, doc, docx, docm

application/json
Body
folder_id string
key string
The key you receive after uploading a file. See /uploads/signed-url

Responses
 200
Request is accepted and a document will be created after the file is converted into readable format, which can take from couple minutes to up to an hour.

 422
application/json
Request validation errors.

Show response attributes
object
 429
application/json
Reached limit for pending file imports. Try again after old imports are finished, or they timeout after an hour due to file conversion failures.

Show response attribute
object
POST
/documents/file
curl \
 --request POST 'https://getcody.ai/api/v1/documents/file' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"folder_id":"string","key":"string"}'
Request examples
{
  "folder_id": "string",
  "key": "string"
}
Response examples (422)
{
  "message": "string",
  "errors": {
    "folder_id": [
      "string"
    ],
    "key": [
      "string"
    ],
    "file_size": [
      "string"
    ],
    "file_name": [
      "string"
    ],
    "content_type": [
      "string"
    ]
  }
}
Response examples (429)
{
  "message": "You have reached the limit of files that can be processed simultaneously. Please try again in few minutes."
}
Create Document from Webpage
POST
/documents/webpage
 Api key
Create a document with a webpage URL.



Webpage must be publicly accessible without a login. If request fails with 400 error code, check if your firewall is blocking requests.

application/json
Body
folder_id string
url string(uri)
Valid and publicly accessible webpage URL.

Responses
 200
application/json
Hide response attribute
object
data object
Show data attributes
object
 400
application/json
Webpage was in-accessible.

Show response attribute
object
 422
application/json
Request validation errors.

Show response attributes
object
POST
/documents/webpage
curl \
 --request POST 'https://getcody.ai/api/v1/documents/webpage' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"folder_id":"string","url":"https://example.com"}'
Request examples
{
  "folder_id": "string",
  "url": "https://example.com"
}
Response examples (200)
{
  "data": {
    "id": "string",
    "name": "string",
    "status": "syncing",
    "content_url": "string",
    "folder_id": "string",
    "created_at": 42
  }
}
Response examples (400)
{
  "message": "string"
}
Response examples (422)
{
  "message": "string",
  "errors": {
    "folder_id": [
      "string"
    ],
    "key": [
      "string"
    ],
    "file_size": [
      "string"
    ],
    "file_name": [
      "string"
    ],
    "content_type": [
      "string"
    ]
  }
}
Get Document
GET
/documents/{id}
 Api key
Get a document by its id.

Path parameters
id string Required
Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
GET
/documents/{id}
curl \
 --request GET 'https://getcody.ai/api/v1/documents/{id}' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Response examples (200)
{
  "data": {
    "id": "string",
    "name": "string",
    "status": "syncing",
    "content_url": "string",
    "folder_id": "string",
    "created_at": 42
  }
}
Delete Document
DELETE
/documents/{id}
 Api key
Delete document by id.

Path parameters
id string Required
Responses
 200
OK

DELETE
/documents/{id}
curl \
 --request DELETE 'https://getcody.ai/api/v1/documents/{id}' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Folders
List Folders
GET
/folders
 Api key
Get all folders

Query parameters
keyword string
Keyword to filter the list to folders that partially match the name.

Responses
 200
application/json
OK

Hide response attributes
object
data array[object]
Show data attributes
object
meta object
Show meta attribute
object
GET
/folders
curl \
 --request GET 'https://getcody.ai/api/v1/folders' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Response examples (200)
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "created_at": 42
    }
  ],
  "meta": {
    "pagination": {
      "count": 42,
      "total": 42,
      "per_page": 42,
      "total_pages": 42,
      "next_page": 42,
      "previous_page": 42
    }
  }
}
Create Folder
POST
/folders
 Api key
Create a folder

application/json
Body
name string
Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
 422
application/json
Request validation failure.

Show response attributes
object
POST
/folders
curl \
 --request POST 'https://getcody.ai/api/v1/folders' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"name":"string"}'
Request examples
{
  "name": "string"
}
Response examples (200)
{
  "data": {
    "id": "string",
    "name": "string",
    "created_at": 42
  }
}
Response examples (422)
{
  "message": "string",
  "errors": {
    "name": [
      "string"
    ]
  }
}
Get Folder
GET
/folders/{id}
 Api key
Get a folder by its id.

Path parameters
id string Required
Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
GET
/folders/{id}
curl \
 --request GET 'https://getcody.ai/api/v1/folders/{id}' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Response examples (200)
{
  "data": {
    "id": "string",
    "name": "string",
    "created_at": 42
  }
}
Update Folder
POST
/folders/{id}
 Api key
Update a folder by its id.

Path parameters
id string Required
application/json
Body
name string
Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
POST
/folders/{id}
curl \
 --request POST 'https://getcody.ai/api/v1/folders/{id}' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"name":"string"}'
Request examples
{
  "name": "string"
}
Response examples (200)
{
  "data": {
    "id": "string",
    "name": "string",
    "created_at": 42
  }
}
Messages
List Messages
GET
/messages
 Api key
Query parameters
conversation_id string
Id of the conversation to filter the list of messages to only that conversation.

includes string
Extra message attributes to include in the response.

Value is sources.

Responses
 200
application/json
OK

Hide response attributes
object
data array[object]
Show data attributes
object
meta object
Show meta attribute
object
GET
/messages
curl \
 --request GET 'https://getcody.ai/api/v1/messages' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Response examples (200)
{
  "data": [
    {
      "id": "string",
      "content": "string",
      "conversation_id": "string",
      "machine": true,
      "failed_responding": true,
      "flagged": true,
      "created_at": 42,
      "sources": {
        "data": {
          "type": "written",
          "created_at": 1693013531,
          "document_id": "Jw31Pv6PMmro",
          "document_url": "https://getcody.ai/directories/1/documents/1",
          "document_name": "How to bake cake"
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "count": 42,
      "total": 42,
      "per_page": 42,
      "total_pages": 42,
      "next_page": 42,
      "previous_page": 42
    }
  }
}
Send Message
POST
/messages
 Api key
Send your message and receive the AI generated response.

application/json
Body
Content can be upto 2000 characters.

content string Required
conversation_id string Required
Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
 402
application/json
When 30 days message limit of your subscription plan is reached.

Show response attribute
object
 422
application/json
Request validation failure.

Show response attributes
object
 500
Sometimes response generation fails due to service overload or network issues. You can fetch the list of messages for the conversation to get the generated error message, or you can use your own error message.

POST
/messages
curl \
 --request POST 'https://getcody.ai/api/v1/messages' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"content":"string","conversation_id":"string"}'
Request examples
{
  "content": "string",
  "conversation_id": "string"
}
Response examples (200)
{
  "data": {
    "id": "string",
    "content": "string",
    "conversation_id": "string",
    "machine": true,
    "failed_responding": true,
    "flagged": true,
    "created_at": 42
  }
}
Response examples (402)
{
  "message": "You have reached the message limit for last 30 days, please wait till tomorrow or upgrade your plan."
}
Response examples (422)
{
  "message": "string",
  "errors": {
    "content": [
      "string"
    ],
    "conversation_id": [
      "string"
    ]
  }
}
Get Message
GET
/messages/{id}
 Api key
Fetch a message by its id.

Path parameters
id string Required
Query parameters
includes string(csv)
Extra message attributes to include in the response.

Value is sources.

Responses
 200
application/json
OK

Hide response attribute
object
data object
Show data attributes
object
GET
/messages/{id}
curl \
 --request GET 'https://getcody.ai/api/v1/messages/{id}' \
 --header "Authorization: Bearer $ACCESS_TOKEN"
Response examples (200)
{
  "data": {
    "id": "string",
    "content": "string",
    "conversation_id": "string",
    "machine": true,
    "failed_responding": true,
    "flagged": true,
    "created_at": 42,
    "sources": {
      "data": [
        {
          "type": "written",
          "created_at": 1693013531,
          "document_id": "Jw31Pv6PMmro",
          "document_url": "https://getcody.ai/directories/1/documents/1",
          "document_name": "How to bake cake"
        }
      ]
    }
  }
}
Send Message for Stream
POST
/messages/stream
 Api key
Send a message and get back a SSE (Server-Sent Events) stream for the AI response.

An example of how to handle SSE stream in Javascript.

let message = ''
const evtSource = new EventSource('https://stream.aimcaiface.com/abc...123')
evtSource.onmessage = (event) => {
  const data = event.data
  if (data === '[END]') {
    // Request is closed by our servers once `[END]` is sent,
    // you must close the request otherwise the browser will keep retrying the URL.
    evtSource.close()
  } else if (data !== '[START]') {
    message += JSON.parse(data).chunk
  }
}
application/json
Body
content string
Content can be upto 2000 characters.

conversation_id string
redirect boolean
By default, your request will be redirected to another url that will be a SSE stream. You can disable that and get the url in a json object instead.

Default value is true.

Responses
 200
application/json
When redirect is set to false

Hide response attribute
object
data object
Show data attribute
object
 302
When redirect is set to true.

Show headers attribute
 402
application/json
When 30 days message limit of your subscription plan is reached.

Show response attribute
object
POST
/messages/stream
curl \
 --request POST 'https://getcody.ai/api/v1/messages/stream' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"content":"string","conversation_id":"string","redirect":true}'
Request examples
{
  "content": "string",
  "conversation_id": "string",
  "redirect": true
}
Response examples (200)
{
  "data": {
    "stream_url": "https://stream.aimcaiface.com/eyJpdiI6ImFyellpVWxScDBJdCtySGo0TzJtV3c9PSIsInZhbHVlIjoibW1VM1BDZkVZTGZ6T0ZrSG50dXhrQT09IiwibWFjIjoiZTA1NzYzMTgyMzUwOTU1MTUzMjYwZWY4NTI0MjcyODgxZjZkZDA1MTE3OWY2MjA5NmEzNTg3ZjdiZTM0NjAxNSIsInRhZyI6IiJ9"
  }
}
Response examples (402)
{
  "message": "You have reached the message limit for last 30 days, please wait till tomorrow or upgrade your plan."
}
Uploads
Get Upload URL
POST
/uploads/signed-url
 Api key
Use this endpoint to get an AWS S3 signed upload url to upload your file to, store the returned key to use after file is uploaded successfully.

Javascript example of how to upload file to the URL you receive from this endpoint:

try {
  // Get the S3 URL to upload file to.
  const authToken = '<Your Cody AI API Key>'
  const response = await fetch('https://getcody.ai/api/v1/uploads/signed-url', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content_type: 'text/plain',
      file_name: 'knowledge.txt'
    })
  })

  const { key, url } = (await response.json()).data

  // Upload the File object to S3
  await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: file, // File object from Web API
  })

  // File is uploaded, now you can use the `key` you got from this endpoint.
} catch {
  // Handle file upload failure.
}
application/json
Body
file_name string
Original file name you want to upload, must contain the file extension.

content_type string
MIME content type of the file.

Responses
 200
application/json
OK

Hide response attributes
object
url string(uri)
AWS S3 signed upload URL, you can make a put request to upload the file.

key string
Key you can use for endpoints that require file uploads.

POST
/uploads/signed-url
curl \
 --request POST 'https://getcody.ai/api/v1/uploads/signed-url' \
 --header "Authorization: Bearer $ACCESS_TOKEN" \
 --header "Content-Type: application/json" \
 --data '{"file_name":"banana_shake.pdf","content_type":"application/pdf"}'
Request examples
{
  "file_name": "banana_shake.pdf",
  "content_type": "application/pdf"
}
Response examples (200)
{
  "url": "https://example.com",
  "key": "string"
}