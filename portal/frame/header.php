<header class="page-head">
  <!-- RD Navbar-->
  <div class="rd-navbar-wrap">
    <nav class="rd-navbar" data-layout="rd-navbar-fixed" data-sm-layout="rd-navbar-fixed" data-md-layout="rd-navbar-fixed" data-md-device-layout="rd-navbar-fixed" data-lg-layout="rd-navbar-static" data-lg-device-layout="rd-navbar-static" data-xl-layout="rd-navbar-static" data-xl-device-layout="rd-navbar-static" data-lg-stick-up="true" data-xl-stick-up="true" data-xxl-stick-up="true" data-stick-up-clone="true">
        
      <div class="rd-navbar-inner">
        <!-- RD Navbar Panel-->
        <div class="rd-navbar-panel">
          <!-- RD Navbar Toggle-->
          <button class="rd-navbar-toggle" data-rd-navbar-toggle=".rd-navbar-nav-wrap"><span></span></button>
          <!-- RD Navbar Brand--><a class="rd-navbar-brand" href="./">
          <div class="brand-logo"><img class="logo" src="images/favicon.ico"></div>
          <div class="brand-name"><span class="text-white font-weight-bold">Soar</span><span>Tech</span></div></a>
        </div>
        <div class="rd-navbar-nav-wrap">
          <!-- RD Navbar Nav-->
          <ul class="rd-navbar-nav">
          
            <li <?php if($path == "home"    ){echo "class=\"active\"";}?> ><a href="index.php?path=home"    >Home</a></li>
            <li <?php if($path == "products"){echo "class=\"active\"";}?> ><a href="index.php?path=products">Products</a></li>
            <li <?php if($path == "about"   ){echo "class=\"active\"";}?> ><a href="index.php?path=about"   >About</a></li>
            <li <?php if($path == "contacts"){echo "class=\"active\"";}?> ><a href="index.php?path=contacts">Contacts</a></li>
            
            <li><a href="https://www.soartechsales.com:9527" target="_blank">LogIn</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</header>