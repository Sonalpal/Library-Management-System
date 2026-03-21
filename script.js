let books =[];

let TitleInput = document.getElementById("titleInput");
let AuthorInput = document.getElementById("authorInput");
let select = document.getElementById("selectInput");
let AddBtn = document.getElementById("addBtn");
let list = document.getElementById("bookList");

let currentFilter="all";

// LOCAL STORAGE

function saveBooks(){
    console.log("inside save books");
    localStorage.setItem("books",JSON.stringify(books));
}




// RENDER BOOKS LOGIC

function renderBooks(){
    
    list.innerHTML="";
    let filteredBook = books;
  
     
   
      if(currentFilter==="issued"){
            filteredBook = filteredBook.filter(element=> element.isIssued);
        }else if(currentFilter==="available"){
            filteredBook = filteredBook.filter(element=> !element.isIssued);
        }
   
  
    filteredBook.forEach(function(book,index){

      

        let li = document.createElement("li");
        let span = document.createElement("span");
        span.textContent= book.title+"   "+ book.author+"   "+"("+book.category+")";
        if(book.isIssued){
            span.style.textDecoration="line-through";
            span.textContent+="(Issued)";
        }
      // ISSUE BUTTON
      
      let issueBtn = document.createElement("button");
      issueBtn.textContent=book.isIssued? "Return":"Issue";

      issueBtn.addEventListener("click",function(event){
           event.stopPropagation();
           book.isIssued = ! book.isIssued;
           saveBooks();
           renderBooks();
      })
    // QUANTITY BUTTON

    let Quantity = document.createElement("span");
    Quantity.textContent= "Qty:"+book.quantity;
        
        // DELETE BUTTON

        let delBtn  = document.createElement("button");
        delBtn.textContent="Delete";
        delBtn.style.marginRight="10px";

        delBtn.addEventListener("click",function(event){
            event.stopPropagation();
            let realIndex = books.indexOf(book);

            if(book.quantity >1){
                book.quantity-=1;
            }else{
                books.splice(realIndex,1);
            }
            
            saveBooks();
            renderBooks();
           
        });

        

        // EDIT BUTTON

        let editBtn = document.createElement("button");
        editBtn.textContent="Edit";
        editBtn.style.marginRight="10px";
        editBtn.addEventListener("click",function(event){
            event.stopPropagation();
            let text = {
                title:prompt("Edit title",book.title),
                author:prompt("Edit author",book.author)

            }

            if(text.title !==null && text.title.trim() !==""){
                book.title=text.title;

            }if(text.author !==null && text.author.trim() !==""){
                book.author=text.author;
            }
            saveBooks();
            renderBooks();
        });
        
        li.appendChild(span);
        li.appendChild(Quantity);
        li.appendChild(issueBtn);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
  
    updateStates();
     if(filteredBook.length ===0){
        list.textContent="No Books Available";
        updateStates();
        return;
    }

}

    // ALL COUNTS LOGIC

function updateStates(){
       
    let totalcount = document.getElementById("totalcount");
    totalcount.textContent="Total Books:   "+ books.length;

    let issueCount = document.getElementById("issuedCount");
    let count = books.filter(element=> element.isIssued).length;
    issueCount.textContent=" Issued Books:  "+ count;

    let availcount = document.getElementById("availcount");
    let Count = books.filter(element=> !element.isIssued).length;
    availcount.textContent="Available Books:  "+ Count;
}



// ADD BOOK LOGIC
function addBook(){

   
    let title = TitleInput.value.trim();
    let author = AuthorInput.value.trim();
    let category = select.value;

    
    let existingBook = books.find(function(book){
       return book.title.toLowerCase()===title.toLowerCase() && book.author.toLowerCase()===author.toLowerCase()
            
    });

    if(existingBook){
        existingBook.quantity+=1;
    }else{
         let book = {
        title:title,
        author:author,
        category:category,
        isIssued:false,
         quantity:1
    };
     books.push(book);
    }

    

   
    saveBooks();
    renderBooks();

    TitleInput.value="";
    AuthorInput.value="";
}
AddBtn.addEventListener("click",addBook);

// SEARCH LOGIC

let search = document.getElementById("search");

search.addEventListener("input",function(){
 let text = search.value.toLowerCase();

 let items= document.querySelectorAll("li");

 items.forEach(element=>{

    let item = element.textContent.toLowerCase();

    if(item.includes(text)){
        element.style.display="block";
    }else{
        element.style.display="none";
    }
      
 })
 });
 // RETRIVING FROM LOCAL STORAGE
 let saved = localStorage.getItem("books");
 if(saved){
    try{
        books=JSON.parse(saved);
        if(!Array.isArray(books)) books=[];
        books.forEach(book=>{
            if(!book.quantity){
                book.quantity=1;
            }
        });
       
    } catch{
            books=[];
        }
}  
    renderBooks();

    //FILTER LOGIC

    let allbooks = document.getElementById("allBtn");
    allbooks.addEventListener("click",function(){
      
       currentFilter="all";
       renderBooks();
    })

    let issueBook = document.getElementById("issuedBtn");
    issueBook.addEventListener("click",function(){
        currentFilter="issued";
        renderBooks();
    })

    let available = document.getElementById("availBtn");
    available.addEventListener("click",function(){
        currentFilter="available";
        renderBooks();
    })