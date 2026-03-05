import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3333";
    const uid = req.headers["memorylane-uid"] as string;

    if (!uid) {
      return res.status(400).json({ error: "Missing memorylane-uid header" });
    }

    const response = await fetch(
      `${backendUrl}/v2/livekit/connection-details`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "memorylane-uid": uid,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error proxying request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
