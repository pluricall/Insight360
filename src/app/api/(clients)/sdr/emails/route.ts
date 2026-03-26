import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/services";
import { altitude } from "@/lib/axios";
import { fetchEmailIdsFromPanther } from "./utils/fetch-email-ids";
import https from "https";

export async function GET(req: NextRequest) {
  try {
    const { access_token: altitudeToken } = await signIn({
      username: process.env.USER_ALTITUDE!,
      password: process.env.PASSWORD_ALTITUDE!
    })

    const { searchParams } = new URL(req.url);
    const datainicio = searchParams.get('datainicio') ?? undefined;
    const datafim = searchParams.get('datafim') ?? undefined;

    const emailIds = await fetchEmailIdsFromPanther({
      datainicio,
      datafim
    });

    const altitudeResponses = await Promise.all(
      emailIds.map(async ({ recording_doc_id }) => {
        const { data } = await altitude.get(`/api/instance/emailManager/emailMessage`,
          {
            params: { emailId: recording_doc_id },
            headers: {
              Authorization: `Bearer ${altitudeToken}`,
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          }
        );
        return {
          subject: data.Subject,
          from: data.From,
          sent: data.SentOn,
          to: data.To,
          htmlBody: data.HtmlBody,
        };
      })
    );

    return NextResponse.json({
      total: altitudeResponses.length,
      emails: altitudeResponses,
    });
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
