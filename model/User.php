<?php
class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($userData) {
        $sql = "INSERT INTO users (firstname, lastname, birthdate, address, phone, email, password, verification_token) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $userData['firstname'],
            $userData['lastname'],
            $userData['birthdate'],
            $userData['address'],
            $userData['phone'],
            $userData['email'],
            password_hash($userData['password'], PASSWORD_DEFAULT),
            bin2hex(random_bytes(32))
        ]);
    }

    public function update($userId, $userData) {
        $sql = "UPDATE users SET 
                firstname = ?, 
                lastname = ?, 
                birthdate = ?, 
                address = ?, 
                phone = ?, 
                email = ? 
                WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $userData['firstname'],
            $userData['lastname'],
            $userData['birthdate'],
            $userData['address'],
            $userData['phone'],
            $userData['email'],
            $userId
        ]);
    }

    public function delete($userId) {
        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$userId]);
    }

    public function findByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function verifyAccount($token) {
        $sql = "UPDATE users SET is_verified = 1 WHERE verification_token = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$token]);
    }
}