<?php
/**
 * Database Backup Script
 * Run: php db-backup.php
 */

$host = '127.0.0.1';
$user = 'root';
$pass = 'mekdi9053@';
$dbname = 'unibite';
$backupFile = 'unibite_backup_' . date('Y-m-d_H-i-s') . '.sql';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database: $dbname\n";
    echo "Creating backup...\n\n";
    
    $backup = "-- MySQL Database Backup\n";
    $backup .= "-- Database: $dbname\n";
    $backup .= "-- Date: " . date('Y-m-d H:i:s') . "\n\n";
    $backup .= "SET FOREIGN_KEY_CHECKS=0;\n\n";
    
    // Get all tables
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "Backing up table: $table\n";
        
        // Drop table statement
        $backup .= "-- Table: $table\n";
        $backup .= "DROP TABLE IF EXISTS `$table`;\n";
        
        // Create table statement
        $createTable = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
        $backup .= $createTable['Create Table'] . ";\n\n";
        
        // Get table data
        $rows = $pdo->query("SELECT * FROM `$table`")->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($rows)) {
            foreach ($rows as $row) {
                $values = array_map(function($value) use ($pdo) {
                    return $value === null ? 'NULL' : $pdo->quote($value);
                }, array_values($row));
                
                $backup .= "INSERT INTO `$table` VALUES (" . implode(', ', $values) . ");\n";
            }
            $backup .= "\n";
        }
    }
    
    $backup .= "SET FOREIGN_KEY_CHECKS=1;\n";
    
    // Write to file
    file_put_contents($backupFile, $backup);
    
    $size = round(filesize($backupFile) / 1024, 2);
    echo "\n✓ Backup completed successfully!\n";
    echo "File: $backupFile\n";
    echo "Size: {$size} KB\n";
    echo "Tables backed up: " . count($tables) . "\n";
    
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
