// controllers/UserController.php
<?php
class UserController {
    private $user;
    private $security;

    public function __construct() {
        $this->user = new User();
        $this->security = new SecurityController();
    }

    public function register($userData, $csrfToken) {
        if (!$this->security->verifyCSRFToken($csrfToken)) {
            throw new Exception("Invalid CSRF token");
        }

        if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }

        if ($this->user->findByEmail($userData['email'])) {
            throw new Exception("Email already exists");
        }

        return $this->user->create($userData);
    }

    public function update($userId, $userData, $csrfToken) {
        $this->security->requireLogin();
        if (!$this->security->verifyCSRFToken($csrfToken)) {
            throw new Exception("Invalid CSRF token");
        }

        return $this->user->update($userId, $userData);
    }

    public function delete($userId, $csrfToken) {
        $this->security->requireLogin();
        if (!$this->security->verifyCSRFToken($csrfToken)) {
            throw new Exception("Invalid CSRF token");
        }

        return $this->user->delete($userId);
    }
}