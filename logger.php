<?php
// logger.php

// --- Impostazioni di Sicurezza e Risposta ---
header("Content-Type: application/json"); // Rispondi in formato JSON
header("Access-Control-Allow-Origin: *"); // Permetti richieste da qualsiasi origine (per test)
// ATTENZIONE: In produzione, sostituisci '*' con il tuo dominio es. "https://www.iltuosito.com"
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Se la richiesta è OPTIONS (pre-flight), termina qui
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// --- Logica del Database ---
try {
    // Connessione al database SQLite. Il file verrà creato se non esiste.
    $pdo = new PDO('sqlite:store.db');
    // Imposta la modalità di errore per lanciare eccezioni in caso di problemi
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Crea la tabella se non esiste (la prima volta che lo script viene eseguito)
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        action_type TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Leggi i dati JSON inviati dal browser
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Validazione base dei dati ricevuti
    if (!isset($data['action_type'])) {
        throw new Exception("action_type è obbligatorio.");
    }

    // Prepara la query di inserimento per prevenire SQL Injection
    $stmt = $pdo->prepare(
        "INSERT INTO user_actions (user_id, action_type, details, ip_address, user_agent)
         VALUES (:user_id, :action_type, :details, :ip_address, :user_agent)"
    );

    // Esegui la query legando i dati
    $stmt->execute([
        ':user_id'      => $data['user_id'] ?? 'anonymous', // Se non c'è user_id, usa 'anonymous'
        ':action_type'  => $data['action_type'],
        ':details'      => $data['details'] ?? null, // Dettagli opzionali
        ':ip_address'   => $_SERVER['REMOTE_ADDR'],
        ':user_agent'   => $_SERVER['HTTP_USER_AGENT']
    ]);

    // Invia una risposta di successo
    echo json_encode(['status' => 'success', 'message' => 'Azione registrata.']);

} catch (Exception $e) {
    // In caso di errore, invia una risposta di errore
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
