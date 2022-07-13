// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user, expand) {
  console.log('Requesting user fragments data...');
  try {
    let url = `${apiUrl}/v1/fragments`;
    if (expand) url += '?expand=1';

    const res = await fetch(url, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragments data', { data });
  } catch (err) {
    console.error('Unable to call GET /v1/fragments', { err });
  }
}

export async function getFragment(user, id, ext, info) {
  console.log('Requesting a single fragment...');

  let data;
  try {
    let url = `${apiUrl}/v1/fragments/${id}${ext}`;
    if (info) url += '/info';
    const res = await fetch(url, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    if (info) data = await res.json();
    else data = await res.text();
    console.log('Got user fragment data', { data });
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id', { err });
  }
}

export async function postFragment(user, fragment, type) {
  console.log('Posting user fragment data...');

  try {
    if (type == 'application/json') {
      fragment = JSON.parse(JSON.stringify(fragment).replace(/\\n/g, '').replace(/ /g, ''));
    }

    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
        'Content-Type': type,
      },
      body: fragment,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    console.log('User fragment data posted', { fragment });
  } catch (err) {
    console.error('Unable to call POST /v1/fragment', { err });
  }
}
