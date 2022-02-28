
const BASE_URL = 'http://localhost:8080/';
let USER_NAME = null;
let USER_TYPE = null;

if (sessionStorage.getItem("username")) USER_NAME = sessionStorage.getItem("username");
if (sessionStorage.getItem("type")) USER_TYPE = sessionStorage.getItem("type");

$(document).ready(function () {

  const logInModal = new bootstrap.Modal(document.getElementById('modalForm'), {
    keyboard: false
  })


  myInit();


  $('#formlogin').submit(async function (e) {

    e.preventDefault();

    let username = $('#username').val();
    let password = $('#password').val();
    let body = { username, password };

    let res = await fetch(`${BASE_URL}api/login`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(body)
    });

    let json = await res.json();

    if (!json.login) return; //login failed

    USER_NAME = json.username;
    USER_TYPE = json.type;

    sessionStorage.setItem("username", json.username);
    sessionStorage.setItem("type", json.type);

    myInit();

    $('#username').val("");
    $('#password').val("");

    logInModal.hide();

  })

  // Add smooth scrolling to all links in navbar + footer link
  $(".navbar a, footer a[href='#myPage']").on('click', function (event) {
    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 900, function () {

        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    } // End if
  });

  $(window).scroll(function () {
    $(".slideanim").each(function () {
      var pos = $(this).offset().top;

      var winTop = $(window).scrollTop();
      if (pos < winTop + 600) {
        $(this).addClass("slide");
      }
    });
  });

})

const myInit = () => {

  loadNav();
  loadUserBtn();
  loadPage();

}

const loadNav = () => {

  let html = `
            <li><a onclick="goToPage('about');">ABOUT</a></li>
            ${USER_NAME ? `<li><a onclick="goToPage('catalog');">CATALOG</a></li>` : ``}
            ${USER_TYPE == 'employee' || USER_TYPE == 'manager' ? `<li><a onclick="goToPage('manage_users');">MANAGE USERS</a></li>` : ``}
            <li><a onclick="goToPage('contact');">CONTACT</a></li>
        `;

  document.getElementById("nav").innerHTML = html;

}

const loadUserBtn = () => {

  const div = document.getElementById("userbtn");

  if (!USER_NAME) {
    div.innerHTML = `
        <button type="button" class="btn btn-primary mx-auto d-block mt-5" data-bs-toggle="modal"
          data-bs-target="#modalForm">
          Log In
        </button>
        `;
  } else {
    div.innerHTML = `
        <button type="button" class="btn btn-primary mx-auto d-block mt-5" onclick="logOut();">
          Log Out
        </button>
        `;
  }

}

const loadPage = () => {
  //${USER_NAME ? `?user=${USER_NAME}` : ``}
  const currentPage = $(location).attr("href").split("#")[1];

  switch (currentPage) {
    case 'about':
      $("#root").load(`${BASE_URL}about`);
      break;
    case 'catalog':
      if (USER_NAME) {
        backDropOpen();
        $("#root").load(`${BASE_URL}catalog2?user=${USER_NAME}`, function () {
          loadCatalog();
        });
      } else {
        $("#root").load(`${BASE_URL}about`);
      }
      break;
    case 'manage_users':
      if (USER_TYPE == 'employee' || USER_TYPE == 'manager') {
        backDropOpen();
        $("#root").load(`${BASE_URL}manage_users?user=${USER_NAME}`, function () {
          $("#add_new_btn").click(function () {
            loadUsers(true);
          })
          loadUsers();
        });
      } else {
        $("#root").load(`${BASE_URL}about`);
      }
      break;
    case 'contact':
      $("#root").load(`${BASE_URL}contact`);
      break;
    default:
      $("#root").load(`${BASE_URL}about`);
      break;
  }

}

const loadCatalog = async () => {

  let res = await fetch(`${BASE_URL}api/flowers?user=${USER_NAME}`);

  let json = await res.json();

  let html = ""
  json.data.map(flower => html += `
  <div class="col-sm-4 col-xs-12" style=margin-bottom:15px>
    <div class="panel panel-default text-center">
      <div class="panel-heading">
        <h1 id="flower_name">${flower.name}</h1>
      </div>
    <div class="panel-body">
      <img id="image" src=${flower.image} alt="Basic pic" style="width:346px;height:200px;">
        <p id="color" class=h5>Color: ${flower.color}</p>
        <p id="description" class=h5>Description: ${flower.description}</p>
    </div>
    <div class="panel-footer">
      <h3 id="price">$${flower.price}</h3>
    </div>
    </div>
  </div>
  `);


  document.getElementById("flowerlist").innerHTML = html;

  if(json.success) backDropClose();
  
}

const loadUsers = async (_add = false) => {

  let res = await fetch(`${BASE_URL}api/users?user=${USER_NAME}`);

  let json = await res.json();

  let users = [];
  if (USER_TYPE != "manager") {
    users = json.data.filter(user => user.category == "customer");
  } else {
    users = json.data;
  }

  let html = ""  
   
  if (_add) {
    html += `
    <tr>
    <td><input type="text" class="form-control" name="name" id="name_adduser"></td>
    <td><input type="text" class="form-control" name="mail" id="mail_adduser"></td>
    <td><input type="text" class="form-control" name="username" id="username_adduser"></td>
    <td><input type="text" class="form-control" name="password" id="password_adduser"></td>
    <td><input type="text" class="form-control" name="phone" id="phone_adduser"></td>
    <td><select class="form-control" name="user_type" id="user_type_adduser">
        <option value="customer">customer</option>
        ${USER_TYPE == "manager" ? `<option value="employee">employee</option>` : ``}
        ${USER_TYPE == "manager" ? `<option value="manager">manager</option>` : ``}
    </select></td>
    <td>
        <a class="add" title="Add" onclick="saveUser();" ><i class="material-icons">&#xE03B;</i></a>
    </td>
    </tr>
    `
  }
  users.map(user => html += `
   <tr id="tr1_${user.id}">
    <td>${user.name}</td>
    <td>${user.mail}</td>
    <td>${user.username}</td>
    ${USER_TYPE == "manager"
    ? `<td>${user.password}</td>`
    : "<td></td>"}
    
    <td>${user.phone}</td>
    <td >${user.category}</td>
    <td>  
        <a class="edit" title="Edit" onclick="toggleEdit('${user.id}');"><i class="material-icons">&#xE254;</i></a>
        ${USER_TYPE == "manager"
          ? `<a class="delete" title="Delete" onclick="deleteUser('${user.id}');"><i class="material-icons">&#xE872;</i></a>`
          : ""}
    </td>
   </tr>
   
   <tr id="tr2_${user.id}" class="edit-tr">
    <td><input type="text" class="form-control" value="${user.name}" id="name_${user.id}"></td>
    <td><input type="text" class="form-control" value="${user.mail}" id="mail_${user.id}"></td>
    <td><input type="text" class="form-control" value="${user.username}" id="username_${user.id}"></td>
    ${USER_TYPE == "manager"
      ? `<td><input type="text" class="form-control" value="${user.password}" id="password_${user.id}"></td>`
      : `<td><input type="text" class="form-control" value="Unauthorized"></input></td>`}
    <td><input type="text" class="form-control" value="${user.phone}" id="phone_${user.id}"></td>
    <td><select class="form-control" value="${user.category}" id="user_type_${user.id}">
        <option value="customer">customer</option>
        ${USER_TYPE == "manager" ? `<option value="employee">employee</option>` : ``}
        ${USER_TYPE == "manager" ? `<option value="manager">manager</option>` : ``}
    </select></td>
    <td>
        <a class="add" title="Add" onclick="updateUser('${user.id}');" ><i class="material-icons">&#xE03B;</i></a>
    </td>

   </tr>
  `);


  document.getElementById("tbusers").innerHTML = html;

  if(json.success) backDropClose();

}

const saveUser = async () => {

  let name = $('#name_adduser').val();
  let mail = $('#mail_adduser').val();
  let username = $('#username_adduser').val();
  let password = $('#password_adduser').val();
  let phone = $('#phone_adduser').val();
  let category = $('#user_type_adduser').val();

  let body = { name, mail, username, password, phone, category };

  //validation

  let res = await fetch(`${BASE_URL}api/users?user=${USER_NAME}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify(body)
  });

  let json = await res.json();

  if (json.success) {
    loadUsers();
    return;
  }

  //if unsuccess

}

const toggleEdit = (_id) => {

  $("#tr1_" + _id).hide();
  $("#tr2_" + _id).show();

}

const updateUser = async (_id) => {

  let name = $('#name_' + _id).val();
  let mail = $('#mail_' + _id).val();
  let username = $('#username_' + _id).val();
  let password = $('#password_' + _id).val();
  let phone = $('#phone_' + _id).val();
  let category = $('#user_type_' + _id).val();

  let body = { name, mail, username, password, phone, category };

  //validation

  let res = await fetch(`${BASE_URL}api/users/${_id}?user=${USER_NAME}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "PUT",
    body: JSON.stringify(body)
  });

  let json = await res.json();
  console.log(json);
  if (json.success) {
    loadUsers();
    return;
  }


}

const deleteUser = async (_id) => {

  let res = await fetch(`${BASE_URL}api/users/${_id}?user=${USER_NAME}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "DELETE"
  });

  let json = await res.json();

  if (json.success) {
    loadUsers();
    return;
  }

}

const logOut = () => {
  USER_NAME = null;
  USER_TYPE = null;
  sessionStorage.clear();
  myInit();
}

const goToPage = (_page) => {
  window.location.href = "#" + _page;
  loadPage();
}

const backDropOpen = () => {
    document.getElementById("backdrop").style.display = "block";
    document.querySelector("body").style.overflow = "hidden";
}

const backDropClose = () => {
  document.getElementById("backdrop").style.display = "none";
  document.querySelector("body").style.overflow = "auto";
}