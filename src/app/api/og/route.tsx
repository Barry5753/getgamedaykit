import { ImageResponse } from "@vercel/og";

import {
  PosterImage,
  getPosterImageSize,
  getPosterParams,
} from "./poster";

export async function GET(request: Request) {
  const posterParams = getPosterParams(request);

  return new ImageResponse(<PosterImage {...posterParams} />, {
    ...getPosterImageSize(),
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
