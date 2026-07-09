#!/usr/bin/env node
/**
 * Set the CORS policy on the R2 images bucket so WebGL texture loads
 * (crossOrigin: anonymous) from the public r2.dev domain succeed.
 *
 * Required for the 3D gallery, which fetches tapestry textures with
 * three.js TextureLoader — canvas/GL use needs Access-Control-Allow-Origin.
 *
 * Usage: node --env-file=.env.local scripts/configure-r2-cors.mjs
 */
import {
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_IMAGES_BUCKET || 'americas-tapestry-images';

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error(
    'Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY',
  );
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const corsConfig = {
  CORSRules: [
    {
      AllowedOrigins: [
        'https://americastapestry.org',
        'https://www.americastapestry.org',
        'https://americastapestry.com',
        'https://www.americastapestry.com',
        'https://shop.americastapestry.com',
        'https://*.vercel.app',
        'http://localhost:3000',
        'http://localhost:3457',
        'http://localhost:3459',
      ],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedHeaders: ['*'],
      MaxAgeSeconds: 86400,
    },
  ],
};

await client.send(
  new PutBucketCorsCommand({ Bucket: bucket, CORSConfiguration: corsConfig }),
);
console.log(`CORS policy set on bucket "${bucket}"`);

const check = await client.send(new GetBucketCorsCommand({ Bucket: bucket }));
console.log(JSON.stringify(check.CORSRules, null, 2));
