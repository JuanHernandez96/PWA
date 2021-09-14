let db; 

const request = indexedDB.open('Amount', 1);

request.onupgradeneeded = function(event){
    const db = event.target.result;
    db.createObjectStore('newTransaction', { autoIncrement: true });
}

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        saveRecord();
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
} 


function saveRecord(record) {
    const transaction = db.transaction(['newTransaction'], 'readwrite');

    const amountObjectStore = transaction.objectStore('newTransaction');

    amountObjectStore.add(record);
}


function uploadAmount() {
    const transaction = db.transaction(['newTransaction'], 'readwrite');

    const amountObjectStore = transaction.objectStore('newTransaction');

    const getAll = amountObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST', 
                body: JSON.stringify(getAll.result.filter(Boolean)[0]),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['newTransaction'], 'readwrite');
                const amountObjectStore = transaction.objectStore('newTransaction');
                amountObjectStore.clear();

                alert('all saved transactions have been submitted')
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}



window.addEventListener('online', uploadAmount);