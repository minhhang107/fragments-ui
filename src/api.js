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

export async function getFragmentData(user, id, ext) {
  console.log('Requesting fragment data...');

  const dataContainer = document.querySelector('#data');
  const image = document.querySelector('#image');
  let data;

  // clear data before getting new data
  dataContainer.textContent = '';
  image.src = '';

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}${ext}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('Content-Type');

    if (contentType === 'application/json') {
      data = await res.json();
      dataContainer.textContent = JSON.stringify(data, null, 4);
    } else if (contentType.includes('image')) {
      data = await res.blob();
      const url = URL.createObjectURL(data);
      image.src = url;
    } else if (contentType.includes('markdown')) {
      data = await res.text();
      dataContainer.textContent = data;
    } else if (contentType.includes('html')) {
      data = await res.text();
      dataContainer.insertAdjacentHTML('beforeend', data);
    } else {
      data = await res.text();
      dataContainer.textContent = data;
    }

    console.log('Got user fragment data', { data });
  } catch (err) {
    console.error(`Unable to call GET /v1/fragments/${id}`, { err });
  }
}

export async function getFragmentInfo(user, id) {
  console.log('Requesting fragment info...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}/info`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragment info', { data });
  } catch (err) {
    console.error(`Unable to call GET /v1/fragments/${id}/info`, { err });
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

export async function updateFragment(user, id, fragment, type) {
  console.log('Updating user fragment data...');

  try {
    if (type == 'application/json') {
      fragment = JSON.parse(JSON.stringify(fragment).replace(/\\n/g, '').replace(/ /g, ''));
    }

    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
        'Content-Type': type,
      },
      body: fragment,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    console.log('User fragment data updated', { fragment });
  } catch (err) {
    console.error(`Unable to call PUT /v1/fragment/${id}`, err);
  }
}

export async function deleteFragment(user, id) {
  console.log('Deleting user fragment...');

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    console.log('Deleted fragment ' + id);
  } catch (err) {
    console.error(`Unable to call DELETE /v1/fragment/${id}`, { err });
  }
}
