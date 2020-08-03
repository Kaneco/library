let myLibrary = [];
let bookTable = document.getElementById("book-list-table"); // Get a reference to the table
let addBookForm = document.getElementById("add-book-form"); // Get the add book form in the modal box
let deleteBookButton = bookTable.getElementsByTagName("button");
let readCheckboxes = bookTable.getElementsByTagName("input");
/* Need a LIVE collection of buttons,  since they are dynamically 
updated depending on the number of books and because queryselectorall() 
returns a static collection */
let firebaseRef = firebase.database().ref("books/");

// Your web app's Firebase configuration
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
let database = firebase.database();

function saveToDB(book) {
	firebaseRef.push({
		title: book.title,
		author: book.author,
		pages: book.pages,
		read: book.read,
	});
}

function getFromDB() {
	myLibrary = []; // clears original stored array to get all books again
	let booksRef = firebase.database().ref("books/");
	let i = 0;
	booksRef.on("value", function (data) {
		data.val().forEach((book) => {
			console.log(book.title, book.author, book.pages, book.read);
			let addedBook = new Book(book.title, book.author, book.pages, book.read); // Creates new book from Form inputs, adds to library and renders to page
			myLibrary.push(addedBook);
			i++;
			//let indexBook = firebase.database().ref("books/" + i);
			//console.log(firebase.database().ref("books/0").on());
		});
	});
}

function Book(title, author, pages, read) {
	//Book object Constructor
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.read = read;
}

Book.prototype.toggleReadStatus = function () {
	//Toggles read status on a book
	if (this.read == true || this.read == "true") {
		this.read = false;
	} else {
		this.read = true;
	}
};

//function toggleReadSta

function addBookToLibrary(book) {
	//add book to the Library list
	myLibrary.push(book);
	//add book to Firebase Library
	saveToDB(book);
}

function removeBookFromLibrary(index) {
	myLibrary.splice(index, 1); // Removes book at index and renders the list again with book removed
	firebase
		.database()
		.ref("books/" + index)
		.remove();
	render();
}

function deleteRow(index) {
	//deletes table row
	document.getElementById("book-list-table").deleteRow(index);
} // deprecated if favor of removeBookFromLibrary();

function addRow(book, index) {
	// Insert a row at the end of the table
	let newRow = bookTable.insertRow(-1);
	newRow.dataset.index = index; // add index number to each row to facilitate searching / deleting books
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
	let readHTML = `<td><div class="switch"><label><input data-index=${index} type="checkbox" id="book${index}-checkbox" class="filled-in" checked="checked"/><span></span> </label> </div></td>`;
	let notReadHTML = `<td><div class="switch"><label><input data-index=${index} type="checkbox" id="book${index}-checkbox" class="filled-in"/><span></span> </label> </div></td>`;
	// readCell.innerHTML = `<td><div class="switch"><label><input type="checkbox" id="book${index}-checkbox" class="filled-in"/><span></span> </label> </div></td>`;
	deleteCell.innerHTML = `<td><button data-index=${index} class="btn-floating btn-small waves-effect waves-light red" type="button"><i class="material-icons right">delete</i></button></td>`;
	if (readStatus == true || readStatus == "true") {
		// Change Checkbox depending on book read status
		//document.getElementById(`book${index}-checkbox`).setAttribute("checked", "checked");
		//document.getElementById(`book${index}-checkbox`).checked = true;
		readCell.innerHTML = readHTML;
	} else {
		// document.getElementById(`book${index}-checkbox`).removeAttribute("checked");
		//document.getElementById(`book${index}-checkbox`).checked = false;
		readCell.innerHTML = notReadHTML;
	}
}

function render() {
	bookTable.innerHTML = ""; // Reset all books already rendered on page
	//Render the books currently in myLibrary to the HTML page
	for (let bookIndex = 0; bookIndex < myLibrary.length; bookIndex++) {
		book = myLibrary[bookIndex];
		addRow(book, bookIndex); // Use bookIndex to have a way to remove / update specific books
	}
	for (let button of deleteBookButton) {
		// adds a event listener for each delete button of the booklist and get the book index of that book
		button.addEventListener("click", (e) => {
			let bookIndex = e.target.parentNode.dataset.index;
			// gets the data-index attribute from the parent element (2 levels above)
			removeBookFromLibrary(bookIndex);
		});
	}
	for (let checkbox of readCheckboxes) {
		// adds a event listener for each checkbox of the booklist and get the book index of that book
		checkbox.addEventListener("click", (e) => {
			let bookIndex = e.target.dataset.index;
			myLibrary[bookIndex].toggleReadStatus();
		});
	}
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

getFromDB();
render();
