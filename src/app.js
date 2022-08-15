// src/app.js

import { Auth, getUser } from './auth';
import {
  deleteFragment,
  getFragmentData,
  getFragmentInfo,
  getUserFragments,
  postFragment,
  updateFragment,
} from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const postSection = document.querySelector('#post-section');
  const getSection = document.querySelector('#get-section');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const postBtn = document.querySelector('#post-btn');
  const getFragmentsBtn = document.querySelector('#get-fragments-btn');
  const getExpandedFragmentsBtn = document.querySelector('#get-expanded-fragments-btn');
  const getDataBtn = document.querySelector('#get-data-btn');
  const getInfoBtn = document.querySelector('#get-info-btn');
  const deleteBtn = document.querySelector('#delete-btn');
  const updateBtn = document.querySelector('#update-btn');
  const fragmentType = document.querySelector('#fragment-type');
  const convertType = document.querySelector('#convert-type');
  const fragmentId = document.querySelector('#fragment-id');
  const updateFragmentId = document.querySelector('#update-fragment-id');
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
    if (fragmentType.value === '') {
      alert('Please select a type');
      return;
    }

    if (fileInput.files.length != 0) {
      const file = fileInput.files[0];
      const name = file.name;
      var ext = name.substr(name.lastIndexOf('.') + 1, name.length);

      if (extToType(ext) !== fragmentType.value) {
        console.log(file.type);
        alert('Please choose a file of selected type');
        return;
      }

      if (fragmentType.value.includes('image')) {
        postFragment(user, file, fragmentType.value);
        fileInput.value = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target.result;
        postFragment(user, fileData, fragmentType.value);
      };
      reader.readAsText(file);

      return;
    }

    if (fragmentInput.value === '') alert('Please enter a fragment');
    else postFragment(user, fragmentInput.value, fragmentType.value);
  };

  getFragmentsBtn.addEventListener('click', () => {
    getUserFragments(user, false);
  });

  getExpandedFragmentsBtn.addEventListener('click', () => {
    getUserFragments(user, true);
  });

  getDataBtn.addEventListener('click', () => {
    if (fragmentId.value === '') alert("Fragment ID can't be blank.");
    else getFragmentData(user, fragmentId.value, convertType.value);
  });

  getInfoBtn.addEventListener('click', () => {
    if (fragmentId.value === '') alert("Fragment ID can't be blank.");
    else getFragmentInfo(user, fragmentId.value);
  });

  deleteBtn.addEventListener('click', () => {
    deleteFragment(user, fragmentId.value);
  });

  updateBtn.addEventListener('click', () => {
    const id = updateFragmentId.value;
    if (id === '') alert("Fragment ID can't be blank.");

    if (fragmentType.value === '') {
      alert('Please select a type');
      return;
    }

    if (fileInput.files.length != 0) {
      const file = fileInput.files[0];

      console.log(file.type);
      if (file.type !== fragmentType.value) {
        alert('Please choose a file of selected type');
        return;
      }

      if (fragmentType.value.includes('image')) {
        updateFragment(user, id, file, fragmentType.value);
        fileInput.value = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target.result;
        updateFragment(user, id, fileData, fragmentType.value);
      };
      reader.readAsText(file);

      return;
    }

    if (fragmentInput.value === '') alert('Please enter a fragment');
    else updateFragment(user, id, fragmentInput.value, fragmentType.value);
  });

  fragmentType.addEventListener('change', () => {
    fileInput.accept = fragmentType.value;
    fragmentInput.disabled = fragmentType.value.includes('image') ? true : false;
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

function extToType(ext) {
  const extensions = ['txt', 'md', 'html', 'json', 'png', 'jpeg', 'webp', 'gif'];
  const types = [
    'text/plain',
    'text/markdown',
    'text/html',
    'application/json',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
  ];
  const index = extensions.findIndex((extension) => extension === ext);
  return types[index];
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
