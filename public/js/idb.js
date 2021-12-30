//create variable to hold db connection
let db;

//establish a connect to IndexedDB database called 'budget-tracker' and set it to version 1
const request = indexedDB.open('budget-tracker',1);

request.onupgradeneeded = function(e){
    //save refernce to database
    const db = e.target.result;
    //create object store called 'new_budget'
    db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function(e){
    db = e.target.result;

    if(navigator.online){
        uploadBudget();
    }
};

request.onerror = function(e){
    console.log(e.target.errorCode);
};

function saveRecord(record){
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_budget'],'readwrite');
    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore("new_budget");

    //add record to the object store with add method
    budgetObjectStore.add(record);
}

function uploadBudget() {
    const transaction = db.transaction(['new_budget'],'readwrite');
    const budgetObjectStore = transaction.objectStore("new_budget");

    const getAll = budgetObjectStore.getAll();
    // if there was data in indexedDb's store, send it to the api server
    getAll.onsuccess = function () {
        if(getAll.result.length > 0){
            fetch("/api/transaction", {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse);
                }
                //open new transaction
                const transaction = db.transaction(['new_budget'],'readwrite');
                //access the object store
                const budgetObjectStore = transaction.objectStore("new_budget");
                // clear all items in your store
                budgetObjectStore.clear();

                alert("All saved transactions have been submitted")
            })
            .catch((err) => {
                console.log(err);
              });      
        }
    };
};

// listen for app coming back online
window.addEventListener('online', uploadBudget);
