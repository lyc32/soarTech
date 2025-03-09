<?php

use PHPMailer\PHPMailer\PHPMailer; 
use PHPMailer\PHPMailer\Exception; 

require './config/PHPMailer.php';
require './config/Exception.php';
require './config/SMTP.php'; 
require './config/SqlConfig.php';

if($_POST == null || $_POST['name'] == null || $_POST['email'] == null ||$_POST['phone'] == null || $_POST['message'] == null)
{
	echo "[ERROR] Bad Request.";
}
else
{
	$name  = $_POST['name'];
	$email = $_POST['email'];
	$phone = $_POST['phone'];
	$message = $_POST['message'];

	$sqlConfig = new SqlConfig();
	try 
	{
		$connection = new PDO("mysql:host=".$sqlConfig->host.";dbname=".$sqlConfig->db."" , $sqlConfig->user, $sqlConfig->pass);

	}
	catch(PDOException $e)
	{
		$connection = null;
		echo "[ERROR] Server Error, Unable To Connect To Database";
	}

	if($connection != null)
	{
		$findMailServer = false;
		$host = "";
		$port = "";
		$user = "";
		$pass = "";
		try 
		{
			$result = $connection->query("SELECT * FROM smtp_mail");
			$arr = array();
			while ($row = $result->fetch())
			{
				$host = $row['host'];
				$port = $row['port'];
				$user = $row['username'];
				$pass = $row['password'];
			}
			$findMailServer = true;
		}
		catch(PDOException $e)
		{
			$findMailServer = false;
			echo "[ERROR] The Mail Server Is Not Configured";
		}
		
		if($findMailServer != false)
		{
			$rootEmail = "";

			try 
			{
				$result = $connection->query("SELECT email FROM account where role = 'root'");
				$arr = array();
				while ($row = $result->fetch())
				{
					$rootEmail = $row['email'];
				}
			}
			catch(PDOException $e)
			{
				$rootEmail = "";
				echo "[ERROR] The Administrator Is Not Online, Please Try Again Later.";
			}
			
			if($rootEmail != "")
			{
				$phpMailer   = new PHPMailer(true);
				$phpMailer->SMTPDebug  = 0;
				$phpMailer->IsSMTP();
				$phpMailer->Host       = $host;
				$phpMailer->SMTPAuth   = true;
				$phpMailer->Username   = $user;
				$phpMailer->Password   = $pass;
				$phpMailer->SMTPSecure = 'ssl'; // or tls
				$phpMailer->Port       = $port;
				$phpMailer->setFrom($user, "SoarTech");
				$phpMailer->addAddress($rootEmail); 
				$phpMailer->isHTML(true);
				$phpMailer->CharSet = "UTF-8";
				$phpMailer->Subject = '['.date('Y-m-d H:i:s').'][SoarTech] You got a message from '. $name; 
				$phpMailer->Body    = "Name: ".$name."<br>Email ID: ".$email."<br>Phone: ".$phone."<br>Message:<br>".$message;

				if(!$phpMailer->send())
				{
					echo "[ERROR] Email Sending Failed";
				} 
				else 
				{
					echo "Email Sending Success";
				}
			}
		}
	}
}
?>
