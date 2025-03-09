<?php

  if($path == "home")
  {
    require "./view/home.php";
  }
  else if($path == "products")
  {
    require "./view/products.php";
  }
  else if($path == "about")
  {
    require "./view/about.php";
  }
  else if($path == "contacts")
  {
    require "./view/contacts.php";
  }
  else 
  {
    require "./view/404.php";
  }
?>