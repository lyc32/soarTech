function sendMail() 
{
	let name    = document.getElementById("contact-name"   ).value;
	let email   = document.getElementById("contact-email"  ).value;
	let phone   = document.getElementById("contact-phone"  ).value;
	let message = document.getElementById("contact-message").value;
	
	if(
	name  != undefined && name  != null && name.trim()  != "" &&
	email != undefined && email != null && email.trim() != "" &&
	phone != undefined && phone != null && phone.trim() != "" &&
	message != undefined && message != null && message.trim() != "")
	{ 
		document.getElementById("messageView").className = "modal-wrapper-show";
		$.ajax({
			url: 'https://www.soartechsales.com/frontend/app/sendmail.php',
			method: 'POST',
			dataType:"text",
			data: {
				name: name,
				email: email,
				phone: phone,
				message: message
			},
			success: function(response) 
			{
				if(response.includes("[ERROR]"))
				{
					document.getElementById("message").innerHTML = response;
					document.getElementById("popProcessBar" ).style.cssText = "display:none";
					document.getElementById("popCloseButton").style.cssText = "display:block";
				}
				else 
				{
					document.getElementById("message").innerHTML = response;
					document.getElementById("popProcessBar").style.cssText = "display:block";
					document.getElementById("popCloseButton").style.cssText = "display:none";
					setTimeout( () => {window.location.href = "https://www.soartechsales.com"}, 3000);
				}
			},
			error: function(xhr, status, error) 
			{
				document.getElementById("message").innerHTML = error;
				document.getElementById("popProcessBar" ).style.cssText = "display:none";
				document.getElementById("popCloseButton").style.cssText = "display:block";
			}
		});
	}
}

function closePop() 
{
	document.getElementById("messageView").className = "modal-wrapper";
	document.getElementById("message").innerHTML = "Please Wait...";
	document.getElementById("popProcessBar" ).style.cssText = "display:none";
	document.getElementById("popCloseButton").style.cssText = "display:none";
}


