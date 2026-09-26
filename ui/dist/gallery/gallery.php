<!DOCTYPE HTML>

<html>
	<head>
		
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" href="assets/css/main.css" />
	
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

        <!-- Bootstrap Min CSS -->
        <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
        <!-- Animate Min CSS -->
        <link rel="stylesheet" href="../assets/css/animate.min.css">
        <!-- FontAwesome Min CSS -->
        <link rel="stylesheet" href="../assets/css/fontawesome.min.css">
        <!-- Owl Carousel Min CSS -->
        <link rel="stylesheet" href="../assets/css/owl.carousel.min.css">
        <!-- FlatIcon CSS -->
        <link rel="stylesheet" href="../assets/css/flaticon.css">
        <!-- Style CSS -->
        <link rel="stylesheet" href="../assets/css/style.css">
		
        <!-- Responsive CSS -->
        <link rel="stylesheet" href="../assets/css/responsive.css">
		
		
		<link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css' />
		<link href='https://fonts.googleapis.com/css?family=Great+Vibes' rel='stylesheet'>
		<link href='https://fonts.googleapis.com/css?family=Cinzel' rel='stylesheet'>
		<link href='https://fonts.googleapis.com/css?family=Croissant+One' rel='stylesheet'>
		<link href='https://fonts.googleapis.com/css?family=Felipa' rel='stylesheet'>
		<link href='https://fonts.googleapis.com/css?family=Emblema+One' rel='stylesheet'>
		
		
		
		<style>
		.carousel-inner img 
		{
			width: 100%;
			height: 100%;
		}
		
		.fixed-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  width: 100%;
  height: 50px;
  background-color: #00a087;
}

/* The element at the top of the page right after the fixed navigation bar
   MUST have sufficient top margin or else it will be covered by the bar */
.contentt {
  margin-top: 20px;
}

/* Example responsive navigation menu  */
.fixed-nav-bar li, .fixed-nav-bar a { 
  height: 50px;
  line-height: 50px;
}
.menu {
  width: 90%;
  max-width: 960px;
  margin: 0 auto;
}
.menu a, .menu a:visited {
  color: #ffffff;
}
.menu a:hover, .menu a:target {
  color: #ebebeb;
}
.menu-items {
  display: inline-block;
}
.sitename {
  display: inline-block;
  margin-right: 20px;
  margin-left: 10px;
}
a.sitename, a:visited.sitename {
  color: #e0e0e0;
}
.menu-items li {
  display: inline-block;
  margin-right: 10px;
  margin-left: 10px;
}
.menu-items a {
  text-decoration: none;
}
.show, .hide {
  display: none;
  padding-left: 15px;
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: center left;
  color: #dde1e2;
}
.show {
  background-image: url(assets/down-arrow-icon.png);
}
.hide {
  background-image: url(assets/up-arrow-icon.png);
}

@media only screen and (max-width: 800px) {
  .menu { 
    position: relative;
    width: 100%;
  }
  .sitename {
    position: absolute;
    top: 0;
    left: 15px;
    margin-left: 0px;
  }
  .menu-items {
    display: none; 
    width: 100%;
    margin-top: 50px;
    background-color: #008378;
  }
  .menu-items li {
    display: block;
    text-align: center;
  }
  .show, .hide {  
    position: absolute;
    top: 0;
    right: 15px;
  }
  .show {
    display: inline-block;
  }
  .hide {
    display: none;
  }
  #menu:target .show {
    display: none;
  }
  #menu:target .hide, #menu:target .menu-items {
    display: inline-block;
  }
}

@media only screen and (max-width: 220px) {
  .sitename, .show, .hide {
    font-size: 14px;
  }
}
		</style>
		
        <title>RP - Full Gallery</title>
        
        <link rel="icon" type="image/jpg" href="../img/2a.jpg">
    </head>
	<body id="home" data-spy="scroll" data-offset="70" style="background-color:#000033">
	
	
    
    
	<body>
<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5f02058af76eff65"></script>
 <?php
	$db= mysqli_connect("localhost","rrp7296","ravi2621@7291","rakeshwarpandey_blog");
	$sql="Update metrics set hits = hits+1 where page_id=8";
	$result = mysqli_query($db,$sql);
	?>
		<div class="page-wrap" style="background-color:#000033">

			<!-- Nav -->
				<nav id="nav" style="background-color:#000033">
					<ul>
						<li><a href="index.php" class="active"><span class="icon fa fa-angle-double-left"></span></a></li>
						<li><a href="gallery.php"><span class="icon fa-camera-retro"></span></a></li>
						<li><a href="../index.php"><span class="icon fa-home"></span></a></li>
						<li><a href="../blog.php"><span class="icon fa fa-rss"></span></a></li>
						<li><a href="../timeline.php"><span class='fa fa-tasks'></span></a></li>
						<li><a href="../more_news.php"><span class='fa fa-newspaper-o'></span></a></li>
					</ul>
				</nav>

			<!-- Main -->
				<section id="main">

					<!-- Header -->
						

					<!-- Gallery -->
						<section id="galleries">

							<!-- Photo Galleries -->
								<div class="gallery">

									<!-- Filters --><header>
									
								<h1>Gallery</h1>
											<ul class="tabs">
												<li><a href="#" data-tag="all" class="button active">All</a></li>
												<li><a href="#" data-tag="international" class="button">INTERNATIONAL</a></li>
												<li><a href="#" data-tag="intuc" class="button">INTUC</a></li>
												<li><a href="#" data-tag="union" class="button">UNIONS</a></li>
												<li><a href="#" data-tag="press" class="button">PRESS RELEASE</a></li>
												<li><a href="#" data-tag="others" class="button">OTHERS</a></li>
											</ul></nav>
									</header>

										<div class="content">
											<div class="media all international">
												<a href="images/fulls/g17.jpg"><img style="height:350px; width:300px; "src="images/thumbs/g17.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											<div class="media all union">
												<a href="images/fulls/g42.jpg"><img style="height:350px; width:300px; padding-left:5px;" src="images/thumbs/g42.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											<div class="media all intuc">
												<a href="images/fulls/g7.jpg"><img style="height:350px; width:300px; padding-left:5px;" src="images/thumbs/g7.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all union">
												<a href="images/fulls/g34.jpg"><img style="height:350px; width:300px; padding-left:5px;" src="images/thumbs/g34.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all international">
												<a href="images/fulls/g20.jpg"><img style="height:350px; width:300px; padding-top:5px;"src="images/thumbs/g20.jpg" alt="" title="This right here is a caption." /></a>
											</div> 
											
											<div class="media all union">
												<a href="images/fulls/g18.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g18.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											
											<div class="media all intuc">
												<a href="images/fulls/g50.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g50.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all union">
												<a href="images/fulls/g2.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g2.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all people">
												<a href="images/fulls/g15.jpg"><img  style="height:350px; width:300px; padding-top:5px;" src="images/thumbs/g15.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all union">
												<a href="images/fulls/g24.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g24.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all intuc">
												<a href="images/fulls/g8.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g8.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all union">
												<a href="images/fulls/g52.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g52.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all press">
												<a href="images/fulls/g44.jpg"><img  style="height:350px; width:300px; padding-top:5px;" src="images/thumbs/g44.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all union">
												<a href="images/fulls/g11.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g11.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											
											<div class="media all intuc">
												<a href="images/fulls/g5.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g5.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											
											<div class="media all union">
												<a href="images/fulls/g53.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g53.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all others">
												<a href="images/fulls/g37.jpg"><img style="height:350px; width:300px; padding-top:5px; padding-top:5px;"  src="images/thumbs/g37.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all intuc">
												<a href="images/fulls/g35.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g35.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all press">
												<a href="images/fulls/g43.jpg"><img  style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g43.jpg" alt="" title="This right here is a caption." /></a>
											</div> 
											
											 
											 <div class="media all intuc">
												<a href="images/fulls/g49.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g49.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all international">
												<a href="images/fulls/g29.jpg"><img style="height:350px; width:300px;  padding-top:5px;"src="images/thumbs/g29.jpg" alt="" title="This right here is a caption." /></a>
											</div> 
											
											<div class="media all intuc">
												<a href="images/fulls/g33.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g33.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all union">
												<a href="images/fulls/g48.jpg"><img  style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g48.jpg" alt="" title="This right here is a caption." /></a>
											
											</div>
											
											<div class="media all intuc">
												<a href="images/fulls/g6.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g6.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all press">
												<a href="images/fulls/g23.jpg"><img  style="height:350px; width:300px; padding-top:5px; " src="images/thumbs/g23.jpg" alt="" title="This right here is a caption." /></a>
											</div> 
											
											
											<div class="media all international">
												<a href="images/fulls/g31.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;"src="images/thumbs/g31.jpg" alt="" title="This right here is a caption." /></a>
											</div>  
											
											<div class="media all others">	
												<a href="images/fulls/g38.jpg"><img  style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g38.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all press">
												<a href="images/fulls/g25.jpg"><img  style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g25.jpg" alt="" title="This right here is a caption." /></a>
											</div> 

											<div class="media all press">
												<a href="images/fulls/g26.jpg"><img  style="height:350px; width:300px; padding-top:5px;" src="images/thumbs/g26.jpg" alt="" title="This right here is a caption." /></a>
											</div> 
											
											<div class="media all others">	
												<a href="images/fulls/g36.jpg"><img  style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g36.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all union">
												<a href="images/fulls/g47.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g47.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all others">	
												<a href="images/fulls/g4.jpg"><img  style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g4.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all international">
												<a href="images/fulls/g19.jpg"><img style="height:350px; width:300px;  padding-top:5px;"src="images/thumbs/g19.jpg" alt="" title="This right here is a caption." /></a>
											</div> 
											
											<div class="media all others">	
												<a href="images/fulls/g14.jpg"><img  style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g14.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											<div class="media all international">
												<a href="images/fulls/g30.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;"src="images/thumbs/g30.jpg" alt="" title="This right here is a caption." /></a>
											</div> 
											
											<div class="media all international">
												<a href="images/fulls/g10.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;"src="images/thumbs/g10.jpg" alt="" title="This right here is a caption." /></a>
											</div>   
											
											<div class="media all others">	
												<a href="images/fulls/g54.jpg"><img  style="height:350px; width:300px; padding-top:5px;" src="images/thumbs/g54.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											<div class="media all union">
												<a href="images/fulls/g1.jpg"><img style="height:350px; width:300px; padding-left:5px; padding-top:5px;" src="images/thumbs/g1.jpg" alt="" title="This right here is a caption." /></a>
											</div>
											
											</div>
										</div>
								</div>
						</section>
					</section>
					
		</div>
<?php include('../footer_1.php'); ?>
		<!-- Scripts -->
			<script src="assets/js/jquery.min.js"></script>
			<script src="assets/js/jquery.poptrox.min.js"></script>
			<script src="assets/js/jquery.scrolly.min.js"></script>
			<script src="assets/js/skel.min.js"></script>
			<script src="assets/js/util.js"></script>
			<script src="assets/js/main.js"></script>

	