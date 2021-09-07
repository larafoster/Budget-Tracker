let db;

//https://www.tutorialspoint.com/html5/html5_indexeddb.htm
const indexedDB =
window.indexedDB ||
window.mozIndexedDB || 
window.webkitIndexedDB || 
window.msIndexedDB;

// Create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {

  const db = event.target.result;
    db.createObjectStore('pending', { autoIncrement: true });
};

request.onerror = function (event) {
  console.log(`Something went wrong!` + event.target.errorCode);
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

const saveRecord = (record) => {

  let transaction = db.transaction(['pending'], 'readwrite');
  let store = transaction.objectStore('pending');

  store.add(record);
};

const checkDatabase = () => {
  // Open a transaction on your pending db
  let transaction = db.transaction(['pending'], 'readwrite');
  // access your pending object
  let store = transaction.objectStore('pending');

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

// event listener for when app comes back online
window.addEventListener("online", checkDatabase);
