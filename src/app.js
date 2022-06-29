// src/app.js

import { Auth, getUser } from './auth';
import { getFragment, getUserFragments, postFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const postSection = document.querySelector('#post-section');
  const getSection = document.querySelector('#get-section');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const postBtn = document.querySelector('#post-btn');
  const getFragmentsBtn = document.querySelector('#get-fragments-btn');
  const getDataBtn = document.querySelector('#get-data-btn');
  const getInfoBtn = document.querySelector('#get-info-btn');
  const fragmentType = document.querySelector('#fragment-type');
  const convertType = document.querySelector('#convert-type');
  const fragmentId = document.querySelector('#fragment-id');
  const expandCheckbox = document.querySelector('#expand-checkbox');
  const fragmentInput = document.querySelector('#fragment-input');
  const fileInput = document.querySelector('#file-input');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  postBtn.onclick = () => {
    postFragment(user, fragmentInput.value, fragmentType.value);
  };

  getFragmentsBtn.addEventListener('click', () => {
    getUserFragments(user, expandCheckbox.checked);
  });

  getDataBtn.addEventListener('click', () => {
    if (fragmentId.value === '') console.error("Fragment ID can't be blank.");
    else getFragment(user, fragmentId.value, convertType.value, false);
  });

  getInfoBtn.addEventListener('click', () => {
    if (fragmentId.value === '') console.error("Fragment ID can't be blank.");
    else getFragment(user, fragmentId.value, '', true);
  });

  fragmentType.addEventListener('change', () => {
    fileInput.accept = fragmentType.value;
  });

  fragmentInput.addEventListener('focus', () => {
    document.querySelector('#post-result').textContent = '';
    document.querySelector('#post-result').hidden = true;
  });

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  postSection.hidden = false;
  getSection.hidden = false;
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
