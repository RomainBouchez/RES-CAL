<?php
class Appointment {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($appointmentData) {
        $sql = "INSERT INTO appointments (user_id, appointment_date, appointment_time, status) 
                VALUES (?, ?, ?, 'confirmed')";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $appointmentData['user_id'],
            $appointmentData['date'],
            $appointmentData['time']
        ]);
    }

    public function getUserAppointments($userId) {
        $sql = "SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_date ASC, appointment_time ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function cancel($appointmentId, $userId) {
        $sql = "UPDATE appointments SET status = 'cancelled' WHERE id = ? AND user_id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$appointmentId, $userId]);
    }

    public function isSlotAvailable($date, $time) {
        $sql = "SELECT COUNT(*) FROM appointments 
                WHERE appointment_date = ? 
                AND appointment_time = ? 
                AND status != 'cancelled'";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$date, $time]);
        return $stmt->fetchColumn() == 0;
    }
}