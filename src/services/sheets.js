import { generateSampleData } from '../data/sampleData';

// REPLACE THIS with your actual Google Apps Script Web App URL after deployment
const GAS_URL = '';

const KEY = 'laporima_v2';

export const loadStore = async () => {
  if (GAS_URL) {
    try {
      const response = await fetch(`${GAS_URL}?action=get`);
      const data = await response.json();
      return data;
    } catch (e) {
      console.error('Failed to load from Google Sheets:', e);
      return getLocalStore();
    }
  } else {
    return getLocalStore();
  }
};

export const saveStore = async (store) => {
  if (GAS_URL) {
    try {
      await fetch(`${GAS_URL}?action=save`, {
        method: 'POST',
        body: JSON.stringify(store),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
    } catch (e) {
      console.error('Failed to save to Google Sheets:', e);
      setLocalStore(store);
    }
  } else {
    setLocalStore(store);
  }
};

function getLocalStore() {
  try { 
    return JSON.parse(localStorage.getItem(KEY)) || generateSampleData(); 
  } catch { 
    return generateSampleData(); 
  }
}

function setLocalStore(store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}
