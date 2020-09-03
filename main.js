let bookTable = document.getElementById("book-list-table"); // Get a reference to the table
let addBookForm = document.getElementById("add-book-form"); // Get the add book form in the modal box

// Firebase configuration
let firebaseConfig = {
	apiKey: "AIzaSyCJuSaj4JaZOmIyY2RU3sQGDVlWV_Wc_B4",
	authDomain: "library-1280f.firebaseapp.com",
	databaseURL: "https://library-1280f.firebaseio.com",
	projectId: "library-1280f",
	storageBucket: "library-1280f.appspot.com",
	messagingSenderId: "168784972966",
	appId: "1:168784972966:web:38287c8d1f52033b3db867",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Get a reference to the database service
let firebaseRef = firebase.database().ref("books");

// Initial Object implementation
// function Book(title, author, pages, read, firebaseKey) {
// 	//Book object Constructor
// 	this.title = title;
// 	this.author = author;
// 	this.pages = pages;
// 	this.read = read;
// 	this.firebaseKey = firebaseKey; // stores firebase book ID to be able to remove the correct book from the db
// }

// // Toggles the read value of any book on both myLibrary and Firebase
// Book.prototype.toggleReadStatus = function () {
// 	readValueRef = firebaseRef.child(this.firebaseKey).child("read");
// 	//Toggles read status on a book
// 	if (this.read == true || this.read == "true") {
// 		this.read = false;
// 		readValueRef.set("false"); // update on firebase
// 	} else {
// 		this.read = true;
// 		readValueRef.set("true");
// 	}
// };

// Library Module
const library = (() => {
	let myLibrary = new Array(0);

	//Gets book from index
	function getBook(index) {
		return myLibrary[index];
	}

	// Finds book in the array which matches the firebaseID
	function findBookIndex(bookID) {
		return myLibrary.findIndex(
			// find index of the book which matches firebaseKey to toggleReadStatus() that index
			(book) => book.firebaseKey === bookID
		);
	}

	//add book to the Library list
	function addToLibrary(book) {
		myLibrary.push(book);
	}

	// Remove book from the Library given a Firebase ID
	function removeBookFromLibrary(firebaseID) {
		for (var i = 0; i < myLibrary.length; i++) {
			if (myLibrary[i].firebaseKey == firebaseID) {
				myLibrary.splice(i, 1); // Removes book at index and renders the list again with book removed
				removeFromDB(firebaseID);
			}
		}
	}

	// Returns the Library
	function getLibrary() {
		return myLibrary;
	}

	//Resets the Library Array
	function clearLibrary() {
		myLibrary.length = 0; // clears original stored array to get all books again
	}

	return {
		getBook,
		findBookIndex,
		addToLibrary,
		removeBookFromLibrary,
		getLibrary,
		clearLibrary,
	};
})();

// Class Based implementation Refactoring
class Book {
	constructor(title, author, pages, read, firebaseKey) {
		//Book object Constructor
		this._title = title;
		this._author = author;
		this._pages = pages;
		this._read = read;
		this._firebaseKey = firebaseKey; // stores firebase book ID to be able to remove the correct book from the db
	}

	get title() {
		return this._title;
	}
	get author() {
		return this._author;
	}
	get pages() {
		return this._pages;
	}
	get read() {
		return this._read;
	}
	get firebaseKey() {
		return this._firebaseKey;
	}
	set firebaseKey(key) {
		this._firebaseKey = key;
	}
	// Toggles the read value of any book on both myLibrary and Firebase
	toggleReadStatus() {
		let readValueRef = firebaseRef.child(this._firebaseKey).child("read");
		//Toggles read status on a book
		if (this._read == true || this._read == "true") {
			this._read = false;
			readValueRef.set("false"); // update on firebase
		} else {
			this._read = true;
			readValueRef.set("true");
		}
	}
}

// Firebase Operations / Database integration

// Remove book with a given firebaseID from the database
function removeFromDB(firebaseID) {
	firebase
		.database()
		.ref("books/" + firebaseID)
		.remove();
}

// Save book to firebase with a Unique ID, ordered my time submitted
function saveToDB(book) {
	let firebaseID = firebaseRef.push({
		title: book.title,
		author: book.author,
		pages: book.pages,
		read: book.read,
	}).key;
	book.firebaseKey = firebaseID; // Add Firebase Key to object to be able to find and upd items on firebase
}

// Get all books from the FirebaseDB and synchs with myLibrary Array
async function getFromDB() {
	return new Promise((resolve) => {
		library.clearLibrary();
		firebaseRef.on("value", function (data) {
			data.forEach((book) => {
				//gets each book from firebase creates new book Object to array in the correct order(chronologically)
				property = book.val();
				let addedBook = new Book(
					property.title,
					property.author,
					property.pages,
					property.read,
					book.key
				);
				library.addToLibrary(addedBook);
			});
			resolve(true);
		});
	});
}

// Insert a book row with the entire formatting and buttons
function addRow(book, firebaseID) {
	let newRow = bookTable.insertRow(-1);
	newRow.id = firebaseID;
	//Add title Field
	let titleCell = newRow.insertCell(-1);
	let titleValue = document.createTextNode(book.title);
	titleCell.appendChild(titleValue);
	//Add Author Field
	let authorCell = newRow.insertCell(-1);
	let authorValue = document.createTextNode(book.author);
	authorCell.appendChild(authorValue);
	//Add pages Field
	let pagesCell = newRow.insertCell(-1);
	let pagesValue = document.createTextNode(book.pages);
	pagesCell.appendChild(pagesValue);
	// Add Read Checkbox and event handler
	let readCell = newRow.insertCell(-1);
	let readStatus = book.read; //store readStatus property for checkbox
	let readHTML = `<td><div class="switch"><label><input type="checkbox" id="${firebaseID}-checkbox" class="filled-in" checked="checked"/><span></span> </label> </div></td>`;
	let notReadHTML = `<td><div class="switch"><label><input type="checkbox" id="${firebaseID}-checkbox" class="filled-in"/><span></span> </label> </div></td>`;
	if (readStatus == true || readStatus == "true") {
		// Change Checkbox depending on book read status
		readCell.innerHTML = readHTML;
	} else {
		readCell.innerHTML = notReadHTML;
	}
	// adds a event listener for the respective book
	let checkbox = document.getElementById(`${firebaseID}-checkbox`);
	checkbox.addEventListener("click", (e) => {
		var bookIndex = library.findBookIndex(firebaseID);
		// toggle book read status on the array and database
		library.getBook(bookIndex).toggleReadStatus();
	});
	// Add Delete Button and event handler
	let deleteCell = newRow.insertCell(-1);
	deleteCell.innerHTML = `<td><button id="${firebaseID}-delete" class="btn-floating btn-small waves-effect waves-light red" type="button"><i class="material-icons right">delete</i></button></td>`;
	// adds a event listener for the respective book
	let deletebtn = document.getElementById(`${firebaseID}-delete`);
	deletebtn.addEventListener("click", (e) => {
		// Delete row corresponding to the bookID
		deleteRow(firebaseID);
		// Remove book from library and DB
		library.removeBookFromLibrary(firebaseID);
	});
}

// deletes row corresponding to the bookID
function deleteRow(bookID) {
	let row = document.getElementById(bookID);
	row.parentElement.removeChild(row);
}

// Event Listener for the submit add book button
addBookForm.addEventListener("submit", function (event) {
	event.preventDefault(); // Prevent the page from being refreshed after submit
	let bookTitle = document.getElementById("book-title").value;
	let bookAuthor = document.getElementById("book-author").value;
	let bookPages = document.getElementById("book-pages").value;
	let bookRead = document.querySelector('input[name="read-status"]:checked')
		.value;
	addBookForm.reset(); // Reset Form Inputs and close modal after submitting
	modal.style.display = "none";
	let addedBook = new Book(bookTitle, bookAuthor, bookPages, bookRead); // Creates new book from Form inputs, adds to library, DB and renders to page
	library.addToLibrary(addedBook);
	saveToDB(addedBook);
	addRow(addedBook, addedBook.firebaseKey);
});

// Modal Attributes
// Get the modal
let modal = document.getElementById("add-book-popup");
// Get the button that opens the modal
let addBookBtn = document.getElementById("add-book-button");
// Get the <span> element (x) that closes the modal
let closeButton = document.getElementsByClassName("close")[0];
// When the user clicks on the button, open the modal
addBookBtn.onclick = function () {
	modal.style.display = "block";
};
// When the user clicks on (x), close the modal
closeButton.onclick = function () {
	modal.style.display = "none";
};
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
};

// Render table with books stored in the DB
function render() {
	bookTable.innerHTML = ""; // Reset all books already rendered on page
	//Render the books currently in myLibrary to the HTML page
	for (var book of library.getLibrary()) {
		addRow(book, book.firebaseKey); // Use book.firebaseKey to have a way to remove / update specific books
	}
}

//Wait for DB fetching before rendering
async function initialRender() {
	await getFromDB();
	render();
}

initialRender();
