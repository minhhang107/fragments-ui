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

export async function postFragment(user, fragment, type) {
  console.log('Posting user fragment data...');
  const postResult = document.querySelector('#post-result');
  try {
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
    postResult.innerHTML = 'Fragment posted successfully!';
    postResult.style.color = 'green';
    console.log('User fragment data posted', { fragment });
  } catch (err) {
    postResult.innerHTML = 'Error posting fragment!';
    postResult.style.color = 'red';
    console.error('Unable to call POST /v1/fragment', { err });
  }
}
