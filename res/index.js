const PER_PAGE = 9;

let current_display = 0,
    search_enabled = 0,
    books_array,
    collection_el = document.querySelector(".collection"),
    more_button = document.querySelector(".more"),
    search_bar = document.querySelector(".search input");


more_button.style.display = "none";

function sleep(time){
    return new Promise(acc => setTimeout(acc, time));
}

function getJson(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "books.json", true);
    return new Promise((acc, rej) => {
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                acc(xhr.responseText);
            }
            else if(xhr.readyState === 4){
                rej(xhr.responseText);
            }
        }

        xhr.send();
    });
}

async function getBooks(){
    let data;
    
    try{
        data = await getJson();
        books_array = JSON.parse(data);   
    }
    catch{
        alert("Error while getting data.");
        return;
    }

    search_enabled = 1;
    more_button.style.display = "";
    displayBooks();
}

function getIcon(type){
    let icon = "";

    switch(type){
        case "autor":
            icon = "user";
            break;
        case "colectie":
            icon = "layers";
            break;
        case "isbn":
            icon = "at-sign";
            break;
        case "editura":
            icon = "pen-tool";
            break;
        case "locatie":
            icon = "map-pin";
            break;
    }

    return "<svg><use href='#icon-" + icon + "'></use></svg>";
}

function generateBook(data){
    let book = document.createElement("div"),
        details = document.createElement("div"),
        image = document.createElement("img"),
        title = document.createElement("h1");

    book.className = "book";
    details.className = "details";
    image.src = "images/image" + data.id + ".jpeg";
    title.innerHTML = data.titlu;

    book.appendChild(image);
    book.appendChild(details);
    details.appendChild(title);

    for(let key in data){
        if(key === "id" || key === "titlu")
            continue;

        let par = document.createElement("p");
        par.title = key.charAt(0).toUpperCase() + key.slice(1);
        par.innerHTML = getIcon(key) + data[key];
        details.appendChild(par);
    }

    collection_el.appendChild(book);

    setTimeout(e => {
        book.classList.add("show");
    }, 100);
}

function displayBooks(){
    for(let i = current_display; i < current_display + PER_PAGE && i < books_array.length; i++){
        if(i == books_array.length - 1){
            more_button.style.display = "none";
        }

        generateBook(books_array[i]);
    }

    current_display += PER_PAGE;
}

async function searchBooks(){
    let term = search_bar.value.trim().toLowerCase(),
        found = false,
        books_shown = [];

    if(term.length < 3){
        collection_el.innerHTML = "";
        current_display = 0;
        displayBooks();
        more_button.style.display = "";
        return;
    }

    more_button.style.display = "none";

    for(let i = 0; i < books_array.length; i++){
        for(let key in books_array[i]){
            if(
                typeof books_array[i][key] === "string" && 
                books_array[i][key].toLowerCase().indexOf(term) != -1 && 
                books_shown.indexOf(books_array[i].id) == -1
            ){
                if(!found){
                    found = true;
                    collection_el.innerHTML = "";
                }

                books_shown.push(books_array[i].id);
                generateBook(books_array[i]);
                await sleep(1);
            }
        }
    }

    if(!found){
        collection_el.innerHTML = "<h1 class='no-results'>No results found.</h1>";
    }
}

let search_timeout = null;

function searchInput(){
    clearTimeout(search_timeout);

    search_timeout = setTimeout(searchBooks, 500);
}

function load(){
    getBooks();
    search_bar.addEventListener("keydown", searchInput);
    more_button.addEventListener("click", displayBooks);
}

window.addEventListener("load", load);