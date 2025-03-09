<?php
require './config/link.php';
require './config/SqlConfig.php';

if($_POST == null)
{
?>

<form id="loginform" name="loginform" method="post" action="">
	MySql Account<br>
	<input name="account"   type="text"  id="account"  /><br>
	MySql Passwor<br>
	<input name="password"  type="text"  id="password" /><br>
	Facebook<br>
	<input name="facebook"  type="text"  id="facebook" /><br>
	Twitter<br>
	<input name="twitter"   type="text"  id="twitter"  /><br>
	WhatsApp<br>
	<input name="whatsapp"  type="text"  id="whatsapp" /><br>
	Instagram<br>
	<input name="instagram" type="text"  id="instagram"/><br>
	<input type="submit" value= "submit" name="submit" id='submit' onclick="" />
</form>


<?php
}
else
{
	$account  = $_POST['account'];
	$password = $_POST['password'];
	
	$newFacebook  = $_POST['facebook'];
	$newTwitter   = $_POST['twitter' ];
	$newWhatsapp  = $_POST['whatsapp'];
	$newInstagram = $_POST['instagram' ];
	
	$sqlConfig = new SqlConfig();
	try 
	{
		$connection = new PDO("mysql:host=".$sqlConfig->host.";dbname=".$sqlConfig->db."" , $account, $password);
	}
	catch(PDOException $e)
	{
		$connection = null;
		echo "[ERROR] Server Error, Unable To Connect To Database";
	}

	if($connection != null)
	{
		$myfile = fopen("./config/link.php", "w") or die("Unable to open file!");
		$txt = "<?php\n 
		\$facebook = \"".$newFacebook."\";\n
		\$twitter = \"".$newTwitter."\";\n
		\$whatsapp = \"".$newWhatsapp."\";\n
		\$instagram = \"".$newInstagram."\";\n
		?>";
		fwrite($myfile, $txt);
		fclose($myfile);
		
		echo "Update Link Success";
	}
}
?>
