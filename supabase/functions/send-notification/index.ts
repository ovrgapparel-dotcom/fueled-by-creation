import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FCM_URL = "https://fcm.googleapis.com/fcm/send";

serve(async (req) => {
  try {
    const { notificationId, title, body, deepLink, imageUrl } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const fcmKey = Deno.env.get("FCM_SERVER_KEY");

    if (!supabaseUrl || !serviceKey || !fcmKey) {
      throw new Error("Missing Supabase or FCM environment variables.");
    }

    // Fetch device tokens from user_devices table
    const tokensRes = await fetch(
      `${supabaseUrl}/rest/v1/user_devices?select=fcm_token`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    const devices = await tokensRes.json();
    const tokens = devices.map((d: any) => d.fcm_token).filter(Boolean);

    if (!tokens.length) {
      return new Response(JSON.stringify({ message: "No tokens found to send notifications." }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Batch tokens (FCM legacy limit is approx 500 per request, but 1000 is theoretical limit)
    const chunkSize = 500;
    const chunks = [];

    for (let i = 0; i < tokens.length; i += chunkSize) {
      chunks.push(tokens.slice(i, i + chunkSize));
    }

    let sentCount = 0;

    // Send batches to FCM
    for (const chunk of chunks) {
      const fcmResponse = await fetch(FCM_URL, {
        method: "POST",
        headers: {
          Authorization: `key=${fcmKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration_ids: chunk,
          notification: {
            title,
            body,
            image: imageUrl || undefined,
          },
          data: {
            deep_link: deepLink,
            notification_id: notificationId,
          },
          priority: "high",
        }),
      });
      
      const fcmResult = await fcmResponse.json();
      sentCount += fcmResult.success || 0;

      // Log the send events to the analytics table
      await fetch(`${supabaseUrl}/rest/v1/notification_events`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(
          chunk.map((token: string) => ({
            notification_id: notificationId,
            device_token: token,
            event_type: "sent",
            platform: "android",
          }))
        ),
      });
    }

    // Mark notification as sent and update total_sent count in the database
    await fetch(
      `${supabaseUrl}/rest/v1/notifications?id=eq.${notificationId}`,
      {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "sent",
          total_sent: sentCount
        }),
      }
    );

    return new Response(JSON.stringify({ success: true, sent: sentCount }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
