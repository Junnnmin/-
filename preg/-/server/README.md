# OCR Server (sample)

This is a sample Node.js Express server which demonstrates how to process PDF uploads and run OCR using Google Cloud Vision.

Important notes:
- Google Cloud Vision Document Text Detection for PDF requires uploading the PDF to Google Cloud Storage and using `asyncBatchAnnotateFiles`.
- You must set up a GCS bucket and set the bucket name in `OCR_BUCKET_NAME` environment variable.
- You must provide a service account JSON and set `GOOGLE_APPLICATION_CREDENTIALS` to point to it.

Setup (quick):

1. Install dependencies

```bash
cd server
npm install
```

2. Set environment variables

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
export GOOGLE_CLOUD_PROJECT=your-project-id
export OCR_BUCKET_NAME=your-gcs-bucket
```

3. Start server

```bash
node server.js
```

The server exposes `POST /api/ocr` that accepts `multipart/form-data` with a single file field `file`. It returns `{ text: string, parsed: object }` JSON. `parsed` contains the fields extracted using basic heuristics (age, incomeBracket, region, children).

This is an example; adjust per your security and performance needs.
