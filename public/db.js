//https://www.tutorialspoint.com/html5/html5_indexeddb.htm
const indexedDB =
window.indexedDB ||
window.mozIndexedDB || 
window.webkitIndexedDB || 
window.msIndexedDB;

let db;
// Create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {

  db = event.target.result;
    db.createObjectStore('pending', { autoIncrement: true });
};

request.onerror = function (event) {
  console.log(`Something went wrong! ${event.target.errorCode}`);
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

const saveRecord = (record) => {

  const transaction = db.transaction(['pending'], 'readwrite');

  const store = transaction.objectStore('pending');

  store.add(record);
};

function checkDatabase() {

  // Open a transaction on your pending db
  let transaction = db.transaction(['pending'], 'readwrite');
  // access your pending object
  const store = transaction.objectStore('pending');

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          
            let transaction = db.transaction('pending', 'readwrite');

            // Assign the current store to a variable
            let currentStore = transaction.objectStore('pending');

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log('Clearing stored data 🧹');
          
        });
    }
  };
}

request.onsuccess = function (event) {
  console.log('success');
  db = event.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);
