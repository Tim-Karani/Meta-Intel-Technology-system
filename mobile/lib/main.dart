import 'package:flutter/material.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize offline SQLite database
  final dbPath = await getDatabasesPath();
  final localDb = await openDatabase(
    p.join(dbPath, 'mit_field_ops.db'),
    version: 1,
    onCreate: (db, version) async {
      await db.execute('''
        CREATE TABLE offline_visits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_uuid TEXT UNIQUE NOT NULL,
          payload_json TEXT NOT NULL,
          sync_status TEXT DEFAULT 'pending',
          created_at TEXT NOT NULL,
          synced_at TEXT
        );
      ''');
      await db.execute('''
        CREATE TABLE cached_locations (
          id TEXT PRIMARY KEY,
          code TEXT,
          name TEXT,
          latitude REAL,
          longitude REAL,
          geofence_radius_meters INTEGER
        );
      ''');
    },
  );

  runApp(MetaIntelApp(database: localDb));
}

class MetaIntelApp extends StatelessWidget {
  final Database database;

  const MetaIntelApp({Key? key, required this.database}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Meta Intel Field Ops',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        useMaterial3: true,
        fontFamily: 'PlusJakartaSans',
      ),
      home: const MobileHomeScreen(),
    );
  }
}

class MobileHomeScreen extends StatelessWidget {
  const MobileHomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Meta Intel Field Operations',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: const Color(0xFF1D4ED8),
        foregroundColor: Colors.white,
        elevation: 1,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.satellite_alt_rounded, size: 64, color: Color(0xFF1D4ED8)),
              SizedBox(height: 16),
              Text(
                'Flutter Mobile Engine Initialized',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text(
                'Offline SQLite Relational Database Connected. GPS Telemetry Guard Ready.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
