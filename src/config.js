const rawVoteApiUrl = import.meta.env.VITE_VOTE_API_URL?.trim() ?? "";

function parseVoteApiUrl(value) {
  if (!value) {
    return { url: null, error: "Missing VITE_VOTE_API_URL." };
  }

  try {
    return { url: new URL(value).toString(), error: null };
  } catch {
    return { url: null, error: "VITE_VOTE_API_URL must be a valid absolute URL." };
  }
}

const voteApiConfig = parseVoteApiUrl(rawVoteApiUrl);

export const VOTE_API_URL = voteApiConfig.url;
export const VOTE_API_CONFIG_ERROR = voteApiConfig.error;
