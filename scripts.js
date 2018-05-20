function openNav() {
  document.getElementById("myNav").style.width = "100%";
  document.getElementById("navbar-button").style.display = "none";
}

function closeNav() {
  document.getElementById("myNav").style.width = "0%";
  document.getElementById("navbar-button").style.display = "inline-block";
}

$("document").ready(function() {
  $("#btn1").click(function() {
    $("html, body").animate(
      {
        scrollTop: $("#about-section").offset().top
      },
      1000
    );
  });
  $("#btn2").click(function() {
    $("html, body").animate(
      {
        scrollTop: $("#tech-heading").offset().top
      },
      1000
    );
  });
  $("#btn3").click(function() {
    $("html, body").animate(
      {
        scrollTop: $("#projects-section").offset().top
      },
      1000
    );
  });
  $("#btn4").click(function() {
    $("html, body").animate(
      {
        scrollTop: $("#contact-section").offset().top
      },
      1000
    );
  });
});

