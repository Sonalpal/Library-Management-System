// ✅ Put this at the top of your script in index.html

import {auth,db} from "../firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged , signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";




let TitleInput = document.getElementById("titleInput");
let AuthorInput = document.getElementById("authorInput");
let select = document.getElementById("selectInput");
let AddBtn = document.getElementById("addBtn");
let allList = document.getElementById("allBookList");
let issuedList = document.getElementById("issuedBookList");
let availableList = document.getElementById("availBookList");
let books= [];

onAuthStateChanged(auth, (user) => {
  if (!user) {
       
     window.location.href="../login/login.html";
  
  }else{
    
    let name = user.email.split("@")[0];
    document.getElementById("userEmail").textContent="👤"+name;
     document.getElementById("userEmail").style.marginRight="10px";

    document.body.style.display="block";
    loadBooks();
   
  }
});

const logoutBtn = document.getElementById("logOut");
logoutBtn.addEventListener("click",function(){
    signOut(auth).then(()=>{
        localStorage.removeItem("currentUser");
        alert("Logged Out Successfully");
         window.location.href="../login/login.html";
    }).catch((error)=>{
        console.log(error);
    });
   
});


// ADD BOOK LOGIC

async function addBook(){

   console.log("inside add book 1")
    let title = TitleInput.value.trim();
    let author = AuthorInput.value.trim();
    let category = select.value;

    if(title ==="" || author===""){
        alert("Fill all fields");
        return ; 
    }
    try{
        await addDoc(collection(db , "books"),{
            title: title,
            author:author,
            category:category,
            quantity:1,
            isIssued:false,
            issuedCount:0
        });
        alert("Book added to database");
        loadBooks();
    }catch(error){
         console.log(error);
         alert("Error adding Book");
    }
      TitleInput.value="";
    AuthorInput.value="";
    // let existingBook = books.find(function(book){
    //    return (book.title.toLowerCase()===title.toLowerCase() && book.author.toLowerCase()===author.toLowerCase() && book.category.toLowerCase()===category.toLowerCase())
            
    // });

    // if(existingBook){
    //     existingBook.quantity+=1;
       
    // }else{
    //      let book = {
    //     title:title,
    //     author:author,
    //     category:category,
    //     issuedCount:0,
    //     isIssued:false,
    //      quantity:1
         
    //    }
    //  books.push(book);
    // }

    

   
    // saveBooks();
    // renderBooks();

  
}
AddBtn.addEventListener("click",addBook);

// LOADING BOOKS FROM FIREBASE

async function loadBooks(){
    console.log("inside loadbooks");
    books =[];
    let snapshot = await getDocs(collection(db,"books"));
    snapshot.forEach((docSnap)=>{
        books.push({
            id:docSnap.id,...docSnap.data()
        });
    });
    renderBooks();
    updateStates();
    
}
// RENDER BOOKS LOGIC

function renderBooks(){
    console.log("inside render 3");

  
    allList.innerHTML="";
    issuedList.innerHTML="";
    availableList.innerHTML="";
    
    //  if(books.length ===0){
    //     allList.textContent="No Books Available";
    //     updateStates();
      
    // }
   
    books.forEach(function(book,index){
        //ALL BOOKS
        
        allList.appendChild(createBookItem(book,"all"));
        
      //ISSUED BOOKS

        if(book.issuedCount>0){
            issuedList.appendChild(createBookItem(book,"issued"));

        }
        //AVAILABLE BOOKS
        if((book.quantity - (book.issuedCount||0))>0){
            availableList.appendChild(createBookItem(book,"available"));
        }
       
    });
      if(issuedList.innerHTML===""){
        issuedList.innerHTML="<p>No Books ssued</p>";
    }

    if(availableList.innerHTML===""){
        availableList.innerHTML="<p>No Books available</p>";
    }
    
  
    updateStates();

}


// window.addEventListener("DOMContentLoaded",()=>{
//    let currentUser = localStorage.getItem("currentUser");
// if(!currentUser){
//     console.log("user in index:",currentUser);
//     window.location.href="login.html";
// }
// });



// OVERDUE LOGIC IS NOT WORKING AND ALSO THE BOOK ARE NOT DISPLAYING IN THE AVAILABLE SECTION







// LOCAL STORAGE

// function saveBooks(){
//     console.log("inside save books 2");
//     localStorage.setItem("books",JSON.stringify(books));
// }

// CREATE BOOK ITEM

function createBookItem(book,section){

    console.log("inside createBookItem");
    let li = document.createElement("li");
    li.style.display="flex";
    li.style.justifyContent="space-between";
    li.style.alignItems="center";

    let span = document.createElement("span");
    span.textContent=book.title + " "+ book.author + "("+ book.category + ")";

    // ADD and MINUS BUTTON

   let qtyContainer = document.createElement("div");
   qtyContainer.classList.add("qty-box");
    // qtyContainer.style.gap="8px";

    //minus button
    let minusBtn = document.createElement("button");
    minusBtn.textContent="-";

    //TEXT
    let qtyText = document.createElement("span");
    
    //PLUS BUTTON
    let PlusBtn = document.createElement("button");
    PlusBtn.textContent="+";

      if(section==="all"){
        // qtyText.textContent="hello";
        
    }else if(section==="issued"){
         qtyText.textContent=(book.issuedCount);
    }else if(section==="available"){
         qtyText.textContent=(book.quantity-book.issuedCount);
    }

    PlusBtn.addEventListener("click",async function(e){
        e.stopPropagation();
        try{
            let bookRef = doc(db,"books",book.id);
            await updateDoc(bookRef,{
                quantity:book.quantity +1
            });
            loadBooks();
        }catch(err){
            console.log(err);
        }
        // book.quantity+=1;
        // saveBooks();
        // renderBooks();
    });
    minusBtn.addEventListener("click",async function(e){
        e.stopPropagation();
        if(book.quantity-book.isIssued>0){  
            try{
                     let bookRef = doc(db,"books",book.id);
                     await updateDoc(bookRef,{
                        quantity:book.quantity -1
                     })
                     loadBooks();
            }catch(err){
                console.log(err);
            }
        }   
        // }else{
        //     alert("Cannot reduce. Some copies are issued");
        //     return;
        // }
        //  saveBooks();
        // renderBooks();
    });

    
     qtyContainer.appendChild(PlusBtn);
 
    qtyContainer.appendChild(qtyText);
       qtyContainer.appendChild(minusBtn);
   



        // ISSUE BUTTON
      let issueBtn = document.createElement("button");
      issueBtn.textContent=book.issuedCount>0? "Return":"Issue";
       
      issueBtn.addEventListener("click",async function(event){
           event.stopPropagation();
           try{
           
            let bookRef = doc(db,"books",book.id);

             if(book.quantity-book.issuedCount >0 ){
               
            let dueDate = prompt("Enter return date :(YYYY-MM-DD)");
            if(!dueDate) return;
         
             await updateDoc(bookRef,{
                issuedCount:(book.issuedCount || 0)+1,
                isIssued:true,
                duedate:dueDate
             });
            // book.duedate = dueDate;
            // book.issuedCount+=1;
            // book.isIssued=true;
            
           }
           
          else{
            
               if(book.issuedCount>0){
                let newCount = book.issuedCount -1;
                await updateDoc(bookRef,{
                    issuedCount:newCount,
                    isIssued:newCount>0,
                    duedate:newCount===0?"":book.duedate
                });
                //    book.issuedCount-=1;
               }
                    //  if(book.issuedCount===0){
                    //       book.isIssued=false;
                    //       book.duedate="";
                    //    }
               
           }
           loadBooks();
        }catch(err){
           console.log(err);
           alert("Error updating books");
        }
          
           
           
      });


  

        
        // EDIT BUTTON

        let editBtn = document.createElement("button");
        editBtn.textContent="Edit";
        editBtn.style.marginRight="10px";
        editBtn.addEventListener("click",async function(event){
            event.stopPropagation();
            let changeTitle =prompt("Edit title",book.title);
               
            let changeAuthor=prompt("Edit author",book.author);

            
                console.log("after if statement in edit buttonnnnnnnnnnnnnn");
            if(!changeTitle|| !changeAuthor) return ; 
           console.log("after if statement in edit button");
            try{
                console.log("inside try block");
                let bookRef = doc(db,"books",book.id);
                await updateDoc(bookRef,{
                    title :changeTitle,
                    author:changeAuthor
                });
                loadBooks();
            }catch(err){
                console.log("inside catch nnnnnnnnnnnn");
                console.log(err);
            }
            // if(text.title !==null && text.title.trim() !==""){
            //     book.title=text.title;

            // }if(text.author !==null && text.author.trim() !==""){
            //     book.author=text.author;
            // }
            // saveBooks();
            // renderBooks();
        });

    
    // DELETE BUTTON

        let delBtn  = document.createElement("button");
        delBtn.textContent="Delete";
        delBtn.style.marginRight="10px";
        

        delBtn.addEventListener("click",async function(event){
            event.stopPropagation();
            try{
                await deleteDoc(doc(db,"books",book.id));
                alert("Deleted");
                loadBooks();
            }catch(err){
                console.log(err);
            }
            // let realIndex = books.indexOf(book);

            // if(book.quantity >1){
            //     book.quantity-=1;
            // }else{
            //     books.splice(realIndex,1);
            // }
            
            // saveBooks();
            // renderBooks();
           
        });



    // if(section ==="issued"){
    //     span.style.textDecoration="line-through";
    //      // DUE DATE LOGIC
         
    //      let today = new Date();
    //      today.setHours(0,0,0,0);
    //      let due = document.createElement("span");
         

    //     if(book.isIssued && book.duedate){
    //         let dueDateObj = new Date(book.duedate);
    //         due.textContent="Due:"+book.duedate;
    //         due.style.marginRight="10px";
    //      // OVERDUE logic
    //              if(dueDateObj<today){
    //                  due.style.color="red";
                   
                  
    //                  const utc1 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    //                  const utc2 = Date.UTC(dueDateObj.getFullYear(),dueDateObj.getMonth(), dueDateObj.getDate());

    //                 const diffMs = Math.abs(utc1 - utc2);

    //                 let days=Math.floor(diffMs / (1000 * 60 * 60 * 24));
    //                 let fine = days*5;
    //                 due.textContent+="( Overdue )"+ "fine:  "+fine;
    //                 }
    //     }else{
    //               due.textContent="";
    //      }
         
    //      li.appendChild(span);
       
    //      li.appendChild(due);
    //      li.appendChild(issueBtn);
    //     li.appendChild(editBtn);
    //      li.appendChild(delBtn);
    //      return li;

       
    // }     
  
    li.appendChild(span);
    
    li.appendChild(qtyContainer);
    li.appendChild(issueBtn);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    return li;
}







    // ALL COUNTS LOGIC

function updateStates(){
       
    let totalcount = document.getElementById("allCount");
    let total = books.reduce((sum,book)=>sum+book.quantity,0);
  
    totalcount.textContent=total;

     let issueCount = document.getElementById("issueCount");
    let count1 =books.reduce((sum , book)=>sum + (book.issuedCount||0),0);
    issueCount.textContent=count1;

    let availcount = document.getElementById("availCount");
     let Count2 = books.reduce((sum,book)=> sum+ ((book.quantity - book.issuedCount)||0),0);
     availcount.textContent=Count2;
}
// SEARCH LOGIC

let search = document.getElementById("search");

search.addEventListener("input",function(){
 let text = search.value.toLowerCase();

 let allItems= document.querySelectorAll("#allBookList li");

 allItems.forEach((item)=>{
    let content = item.textContent.toLowerCase();
    if(content.includes(text)){
     item.style.display="flex";
    }else{
        item.style.display="none";
    }
   })   
      
 });

 // RETRIVING FROM LOCAL STORAGE
//  let saved = localStorage.getItem("books");
//  if(saved){
//     try{
//         books=JSON.parse(saved);
//         if(!Array.isArray(books)) books=[];
//         books.forEach(book=>{
//             if(!book.quantity){
//                 book.quantity=1;
//             }
//         });
       
//     } catch{
//             books=[];
//         }
// }  
//     renderBooks();

     // SORTING LOGIC

        // document.getElementById("sortTitle").addEventListener("click",function(){
        //     books.sort((a,b)=> a.title.localeCompare(b.title));
        //     renderBooks();
        // })

        // document.getElementById("sortAuthor").addEventListener("click",function(){
        //     books.sort((a,b)=> a.author.localeCompare(b.author));
        //     renderBooks();
        // })

    //FILTER LOGIC

    // let allbooks = document.getElementById("allBtn");
    // allbooks.addEventListener("click",function(){
      
    //    currentFilter="all";
    //    renderBooks();
    // })

    // let issueBook = document.getElementById("issuedBtn");
    // issueBook.addEventListener("click",function(){
    //     currentFilter="issued";
    //     renderBooks();
    // })

    // let available = document.getElementById("availBtn");
    // available.addEventListener("click",function(){
    //     currentFilter="available";
    //     renderBooks();
    // })