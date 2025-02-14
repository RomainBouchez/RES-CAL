// controllers/AppointmentController.php
<?php
class AppointmentController {
    private $appointment;
    private $security;

    public function __construct() {
        $this->appointment = new Appointment();
        $this->security = new SecurityController();
    }

    public function create($appointmentData, $csrfToken) {
        $this->security->requireLogin();
        if (!$this->security->verifyCSRFToken($csrfToken)) {
            throw new Exception("Invalid CSRF token");
        }

        if (!$this->appointment->isSlotAvailable($appointmentData['date'], $appointmentData['time'])) {
            throw new Exception("This time slot is not available");
        }

        return $this->appointment->create($appointmentData);
    }

    public function getUserAppointments($userId) {
        $this->security->requireLogin();
        return $this->appointment->getUserAppointments($userId);
    }

    public function cancel($appointmentId, $userId, $csrfToken) {
        $this->security->requireLogin();
        if (!$this->security->verifyCSRFToken($csrfToken)) {
            throw new Exception("Invalid CSRF token");
        }

        return $this->appointment->cancel($appointmentId, $userId);
    }
}