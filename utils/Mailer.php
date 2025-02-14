<?php
class Mailer {
    public static function sendVerificationEmail($email, $token) {
        $to = $email;
        $subject = "Vérification de votre compte";
        $message = "Cliquez sur ce lien pour vérifier votre compte : " . 
                   "http://votre-site.com/verify.php?token=" . $token;
        $headers = "From: noreply@votre-site.com";

        return mail($to, $subject, $message, $headers);
    }

    public static function sendAppointmentConfirmation($email, $date, $time) {
        $to = $email;
        $subject = "Confirmation de rendez-vous";
        $message = "Votre rendez-vous a été confirmé pour le " . $date . " à " . $time;
        $headers = "From: noreply@votre-site.com";

        return mail($to, $subject, $message, $headers);
    }

    public static function sendCancellationNotification($email, $date, $time) {
        $to = $email;
        $subject = "Annulation de rendez-vous";
        $message = "Votre rendez-vous du " . $date . " à " . $time . " a été annulé";
        $headers = "From: noreply@votre-site.com";

        return mail($to, $subject, $message, $headers);
    }
}