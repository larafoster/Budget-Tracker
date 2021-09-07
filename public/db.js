let db;
//https://www.tutorialspoint.com/html5/html5_indexeddb.htm
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

const request = indexedDB.open ('budget', 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore ('pending', {autoIncrement: true});
};

request.onerror = function (event) {
  console.log ('Something went wrong! ' + event.target.errorCode);
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase ();
  }
};

function saveRecord (record) {
  const transaction = db.transaction (['pending'], 'readwrite');
  const store = transaction.objectStore ('pending');
  store.add (record);
}

function checkDatabase () {
  const transaction = db.transaction (['pending'], 'readwrite');
  const store = transaction.objectStore ('pending');
  const getAll = store.getAll ();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch ('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify (getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then (response => response.json ())
        .then (() => {
          const transaction = db.transaction (['pending'], 'readwrite');
          const store = transaction.objectStore ('pending');
          store.clear ();
        });
    }
  };
}

// event listener for when app comes back online
window.addEventListener ('online', checkDatabase);
