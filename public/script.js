function openLoginPopup() {
   document.getElementById('loginPopup').style.display = 'block';
   console.log('hi');
};

function closeLoginPopup() {
   console.log("hello");
   document.getElementById('loginPopup').style.display = 'none';
};

window.onload = function() {
      openLoginPopup();
    };

document.getElementById('closeButton').addEventListener('click', closeLoginPopup);


