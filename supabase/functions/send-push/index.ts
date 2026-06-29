import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PushMode = 'new_job' | 'cancelled_job';

type RequestBody = {
  mode: PushMode;
  jobId: string;
  title?: string;
  body?: string;
};

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase env fehlt' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as RequestBody;

    if (!body.jobId || !body.mode) {
      return new Response(JSON.stringify({ error: 'jobId oder mode fehlt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const rpcName =
      body.mode === 'cancelled_job'
        ? 'push_tokens_for_cancelled_job'
        : 'push_tokens_for_new_job';

    const { data, error } = await supabase.rpc(rpcName, {
      p_job_id: body.jobId,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tokens = [...new Set((data ?? []).map((row: { expo_push_token: string }) => row.expo_push_token).filter(Boolean))];

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, message: 'Keine Push Tokens gefunden' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title: body.title ?? 'Mitarbeiter Abruf',
      body:
        body.body ??
        (body.mode === 'cancelled_job'
          ? 'Ein zugesagter Auftrag wurde storniert.'
          : 'Ein neuer Auftrag ist verfuegbar.'),
      data: {
        jobId: body.jobId,
        mode: body.mode,
      },
    }));

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const expoResult = await expoResponse.json();

    return new Response(
      JSON.stringify({
        ok: true,
        sent: tokens.length,
        expoResult,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
