const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_FILES = 3;
const MAX_CATEGORIES = 12;
const KINDS = ['image', 'frames', 'audio'];

const SCHEMA = {
  type: 'object',
  properties: {
    description: { type: 'string' },
    category: { type: 'string' },
    confidence: { type: 'number' },
    observations: { type: 'array', items: { type: 'string' } },
  },
  required: ['description', 'category', 'confidence', 'observations'],
};

function visionPrompt(kind, categories) {
  const subject =
    kind === 'frames'
      ? 'a series of frames sampled in order from a single video'
      : 'a single image';
  return [
    `You are analysing ${subject}.`,
    'Describe what is happening: the setting, the subjects, what they appear to be doing, and anything notable that you can actually see. Be concrete, and do not guess at things that are not visible.',
    `Then classify it into exactly one of these categories: ${categories.join(', ')}. Return the category label exactly as written.`,
    'Give your confidence in that classification as a number between 0 and 1.',
    'List three to six short observations that support the classification.',
  ].join('\n');
}

function audioPrompt(transcript, categories) {
  return [
    'You are analysing an audio recording. A transcript of it is provided below.',
    `Transcript: """${transcript}"""`,
    'Describe what is happening in the recording: who seems to be speaking, what they are talking about, and what kind of situation it is. Base everything on the transcript.',
    `Then classify the recording into exactly one of these categories: ${categories.join(', ')}. Return the category label exactly as written.`,
    'Give your confidence in that classification as a number between 0 and 1.',
    'List three to six short observations that support the classification.',
  ].join('\n');
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) {
      return Response.json({ error: 'Please sign in before analysing media.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const kind = String(body.kind || '');
    const fileUris = Array.isArray(body.file_uris)
      ? body.file_uris.filter((uri) => typeof uri === 'string' && uri.length > 0)
      : [];
    const categories = (Array.isArray(body.categories) ? body.categories : [])
      .map((value) => String(value).trim().slice(0, 40))
      .filter(Boolean)
      .slice(0, MAX_CATEGORIES);

    if (!KINDS.includes(kind)) {
      return Response.json({ error: 'Unsupported media type.' }, { status: 400 });
    }
    if (!fileUris.length || fileUris.length > MAX_FILES) {
      return Response.json({ error: 'Send between one and three files.' }, { status: 400 });
    }
    if (categories.length < 2) {
      return Response.json({ error: 'Provide at least two categories.' }, { status: 400 });
    }

    const core = db.asServiceRole.integrations.Core;

    const signed = await Promise.all(
      fileUris.map((file_uri) =>
        core.CreateFileSignedUrl({ file_uri, expires_in: 900 })
      )
    );
    const urls = signed.map((entry) => entry && entry.signed_url).filter(Boolean);
    if (urls.length !== fileUris.length) {
      return Response.json({ error: 'One of those files could not be read.' }, { status: 400 });
    }

    let transcript = null;
    const payload = { prompt: '', response_json_schema: SCHEMA };

    if (kind === 'audio') {
      const spoken = await core.TranscribeAudio({ audio_url: urls[0] });
      const clean = String(spoken || '').trim();
      if (!clean) {
        return Response.json(
          { error: 'I could not find any speech in that recording.' },
          { status: 400 }
        );
      }
      transcript = clean.slice(0, 6000);
      payload.prompt = audioPrompt(transcript, categories);
    } else {
      payload.prompt = visionPrompt(kind, categories);
      payload.file_urls = urls;
    }

    const raw = await core.InvokeLLM(payload);
    const data = typeof raw === 'string' ? { description: raw } : raw || {};

    return Response.json({
      description: String(data.description || '').trim(),
      category: String(data.category || '').trim(),
      confidence: Number(data.confidence) || 0,
      observations: Array.isArray(data.observations)
        ? data.observations.map((item) => String(item)).slice(0, 8)
        : [],
      transcript,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}