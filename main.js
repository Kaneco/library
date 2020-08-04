let myLibrary = [];
let bookTable = document.getElementById("book-list-table"); // Get a reference to the table
let addBookForm = document.getElementById("add-book-form"); // Get the add book form in the modal box
let deleteBookButton = bookTable.getElementsByTagName("button");
let readCheckboxes = bookTable.getElementsByTagName("input");
/* Need a LIVE collection of buttons,  since they are dynamically 
updated depending on the number of books and because queryselectorall() 
returns a static collection */

// Test Books for implementation
// const book1 = new Book("The Hobbit0", "J.R.R. Tolkien0", 111, true);
// const book2 = new Book("The Hobbit1", "J.R.R. Tolkien1", 222, true);
// const book3 = new Book("The Hobbit2", "J.R.R. Tolkien2", 333, false);

// Firebase configuration
var firebaseConfig = {
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

function Book(title, author, pages, read, firebaseKey) {
	//Book object Constructor
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.read = read;
	this.firebaseKey = firebaseKey; // stores firebase book ID to be able to remove the correct book from the db
}

// Toggles the read value of any book on both myLibrary and Firebase
Book.prototype.toggleReadStatus = function () {
	readValueRef = firebaseRef.child(this.firebaseKey).child("read");
	//Toggles read status on a book
	if (this.read == true || this.read == "true") {
		this.read = false;
		readValueRef.set("false"); // update on firebase
	} else {
		this.read = true;
		readValueRef.set("true");
	}
};

//add book to the Library list
function addBookToLibrary(book) {
	myLibrary.push(book);
	//add book to Firebase Library
	saveToDB(book);
}

function removeBookFromLibrary(firebaseID) {
	for (var i = 0; i < myLibrary.length; i++) {
		if (myLibrary[i].firebaseKey == firebaseID) {
			myLibrary.splice(i, 1); // Removes book at index and renders the list again with book removed
			removeFromDB(firebaseID);
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
function getFromDB() {
	myLibrary.length = 0; // clears original stored array to get all books again
	firebaseRef.on("value", function (data) {
		data.forEach((book) => {
			//gets each book from firebase creates new book Object to array in the correct order(chronologically)
			property = book.val();
			//console.log(property.title, property.author, property.pages, property.read, book.key);
			let addedBook = new Book(
				property.title,
				property.author,
				property.pages,
				property.read,
				book.key
			);
			myLibrary.push(addedBook);
		});
	});
	console.log("getfromDB");
	console.table(myLibrary);
	return myLibrary;
}

function addRow(book, firebaseID) {
	// Insert a row at the end of the table
	let newRow = bookTable.insertRow(-1);
	newRow.dataset.key = firebaseID; // add firebaseID number to each row to facilitate searching / deleting books
	for (const property in book) {
		if (property == "read") {
			//Fill Only first 3 Properties (avoid toggleReadStatus()property with this)
			break;
		}
		let cell = newRow.insertCell(-1);
		let value = document.createTextNode(book[property]);
		cell.appendChild(value);
	} // Fills Read Checkbox and Delete Button
	let readCell = newRow.insertCell(-1);
	let deleteCell = newRow.insertCell(-1);
	let readStatus = book.read; //store readStatus property for checkbox
	let readHTML = `<td><div class="switch"><label><input data-key=${firebaseID} type="checkbox" id="book${firebaseID}-checkbox" class="filled-in" checked="checked"/><span></span> </label> </div></td>`;
	let notReadHTML = `<td><div class="switch"><label><input data-key=${firebaseID} type="checkbox" id="book${firebaseID}-checkbox" class="filled-in"/><span></span> </label> </div></td>`;
	// readCell.innerHTML = `<td><div class="switch"><label><input type="checkbox" id="book${firebaseID}-checkbox" class="filled-in"/><span></span> </label> </div></td>`;
	deleteCell.innerHTML = `<td><button data-key=${firebaseID} class="btn-floating btn-small waves-effect waves-light red" type="button"><i class="material-icons right">delete</i></button></td>`;
	if (readStatus == true || readStatus == "true") {
		// Change Checkbox depending on book read status
		//document.getElementById(`book${firebaseID}-checkbox`).setAttribute("checked", "checked");
		//document.getElementById(`book${firebaseID}-checkbox`).checked = true;
		readCell.innerHTML = readHTML;
	} else {
		// document.getElementById(`book${firebaseID}-checkbox`).removeAttribute("checked");
		//document.getElementById(`book${firebaseID}-checkbox`).checked = false;
		readCell.innerHTML = notReadHTML;
	}
}

function render() {
	bookTable.innerHTML = ""; // Reset all books already rendered on page
	console.log(myLibrary);
	//Render the books currently in myLibrary to the HTML page
	for (var bookIndex = 0; bookIndex < myLibrary.length; bookIndex++) {
		book = myLibrary[bookIndex];
		console.log(book);
		addRow(book, book.firebaseKey); // Use book.firebaseKey to have a way to remove / update specific books
	}
	for (var button of deleteBookButton) {
		// adds a event listener for each delete button of the booklist and get the book index of that book
		button.addEventListener("click", (e) => {
			let bookID = e.target.parentNode.dataset.key;
			// gets the data-key attribute from the parent element (2 levels above)
			removeBookFromLibrary(bookID);
			getFromDB();
			render();
		});
	}
	for (var checkbox of readCheckboxes) {
		// adds a event listener for each checkbox of the booklist and get the book index of that book
		checkbox.addEventListener("click", (e) => {
			getFromDB();
			var bookIndex = myLibrary.findIndex(
				// find index of the book which matches firebaseKey to toggleReadStatus() that index
				(book) => book.firebaseKey === e.target.dataset.key
			);
			// let bookID = e.target.dataset.key;
			myLibrary[bookIndex].toggleReadStatus();
		});
	}
	console.log("render ran sucessfully");
}

addBookForm.addEventListener("submit", function (event) {
	// Event Listener for the submit add book button
	event.preventDefault(); // Prevent the page from being refreshed after submit
	let bookTitle = document.getElementById("book-title").value;
	let bookAuthor = document.getElementById("book-author").value;
	let bookPages = document.getElementById("book-pages").value;
	let bookRead = document.querySelector('input[name="read-status"]:checked')
		.value;
	addBookForm.reset(); // Reset Form Inputs and close modal after submitting
	modal.style.display = "none";
	let addedBook = new Book(bookTitle, bookAuthor, bookPages, bookRead); // Creates new book from Form inputs, adds to library and renders to page
	addBookToLibrary(addedBook);
	getFromDB();
	render();
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

console.log("before getfromDB");
console.table(myLibrary);
getFromDB();
render();
console.log("after render");
console.table(myLibrary);
