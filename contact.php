<?php
if($_POST["message"]) {
    mail("sjl2185@barnard", "Form to email message", $_POST["message"], "From: an@email.address");
}
?>



<?php

if($_POST["submit"]) {
    $recipient="sjl2185@barnard.edu";
    $subject="Form to email message";
    $sender=$_POST["sender"];
    $senderEmail=$_POST["senderEmail"];
    $message=$_POST["message"];

    $mailBody="Name: $sender\nEmail: $senderEmail\n\n$message";

    mail($recipient, $subject, $mailBody, "From: $sender <$senderEmail>");

    $thankYou="<p>Thank you! Your message has been sent.</p>";
}

?>