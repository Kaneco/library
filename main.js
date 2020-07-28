let myLibrary = [];
let bookTable = document.getElementById("book-list-table"); // Get a reference to the table


function Book(title, author, pages, read) { //Book object Constructor
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;
}

//book Tests
const book1Test = new Book("The Hobbit", "J.R.R. Tolkien", 295, true);
const book2Test = new Book("The Hobbit2", "J.R.R. Tolkien2", 295, true);
const book3Test = new Book("The Hobbit3", "J.R.R. Tolkien2", 111, "read");
addBookToLibrary(book1Test);
addBookToLibrary(book2Test);
addBookToLibrary(book3Test);

Book.prototype.toggleReadStatus = function() { //Toggles read status on a book
    if (this.read) {
      this.read= false;
    }
    else{
        this.read=true;
    }
  };

function addBookToLibrary(book) {  //add book to the Library list
  return myLibrary.push(book);
}

function deleteRow(index) { //deletes table row
    document.getElementById("book-list-table").deleteRow(index);
}


function addRow(book) {
    // Insert a row at the end of the table
    let newRow = bookTable.insertRow(-1);
    for (const property in book) {
        if (property == "read"){ //Fill Only first 3 Properties (avoid toggleReadStatus()property with this)
            break;
        }
        let cell = newRow.insertCell(-1);
        let value = document.createTextNode(book[property]);
        cell.appendChild(value);
    }
    let readCell = newRow.insertCell(-1);
    if (book.value == true){
        readCell.innerHTML = `<td> <div class="switch"><label>No<input type="checkbox"><span class="lever"></span>Yes</label></div> </td> <td> <button class="btn-floating btn-small waves-effect waves-light red" type="submit" name="action"> <i class="material-icons right">delete</i> </button> </td>`;
    }
    else {
        readCell.innerHTML = `<td> <div class="switch"><label>No<input type="checkbox"><span class="lever"></span>Yes</label></div> </td> <td> <button class="btn-floating btn-small waves-effect waves-light red" type="submit" name="action"> <i class="material-icons right">delete</i> </button> </td>`;
    }
}
    // // Insert a cell in the row at index 0
    // let bookTitle = newRow.insertCell(0);
    // let bookAuthor = newRow.insertCell(-1);
    // let bookPages = newRow.insertCell(-1);
    // let bookRead = newRow.insertCell(-1);
    // // Append a text node to the cell
    // let bookTitleValue = document.createTextNode(book.title);
    // let bookAuthorValue = document.createTextNode(book.author);
    // let bookNameValue = document.createTextNode(book.name);
    // let bookNameValue = document.createTextNode(book.name);
    // bookName.appendChild(newText);

function render(){
    for (let book of myLibrary) {
    }      
}

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
