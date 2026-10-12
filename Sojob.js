// Cola aqui o link de partilha do teu Google Form.
// Podes usar o mesmo link nos dois campos ou dois formulários separados.
var FORM_URL = {
  pro: "",
  cliente: ""
};

(function () {
  var note = document.getElementById("aviso");
  var links = document.querySelectorAll("[data-form]");

  for (var i = 0; i < links.length; i++) {
    (function (a) {
      var url = FORM_URL[a.getAttribute("data-form")] || FORM_URL.pro || FORM_URL.cliente;
      if (url) {
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
      } else {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          note.textContent = "As inscrições abrem em breve. Volta daqui a pouco.";
          note.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    })(links[i]);
  }
})();
