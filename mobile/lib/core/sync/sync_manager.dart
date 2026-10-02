import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:http/http.dart' as http;

class SyncManager {
  final Database localDb;
  final String apiBaseUrl;
  final String userAuthToken;

  SyncManager({
    required this.localDb,
    required this.apiBaseUrl,
    required this.userAuthToken,
  });

  /// Reads pending offline visits from SQLite and uploads to Laravel API
  Future<int> syncUpstream() async {
    // 1. Fetch un-synced visits
    final List<Map<String, dynamic>> pendingRows = await localDb.query(
      'offline_visits',
      where: 'sync_status = ?',
      whereArgs: ['pending'],
      limit: 20,
    );

    if (pendingRows.isEmpty) return 0;

    final batchId = 'batch_${DateTime.now().millisecondsSinceEpoch}';

    // 2. Prepare payload
    final payload = {
      'batch_id': batchId,
      'transactions': pendingRows.map((row) => jsonDecode(row['payload_json'])).toList(),
    };

    // 3. Dispatch to Laravel API
    final response = await http.post(
      Uri.parse('$apiBaseUrl/api/v1/sync/upstream'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $userAuthToken',
      },
      body: jsonEncode(payload),
    );

    if (response.statusCode == 200) {
      final resData = jsonDecode(response.body);
      final List confirmedUuids = resData['data']['confirmed_uuids'];

      // 4. Mark confirmed in SQLite inside transaction
      await localDb.transaction((txn) async {
        for (var uuid in confirmedUuids) {
          await txn.update(
            'offline_visits',
            {'sync_status': 'synced', 'synced_at': DateTime.now().toIso8601String()},
            where: 'client_uuid = ?',
            whereArgs: [uuid],
          );
        }
      });

      return confirmedUuids.length;
    } else {
      throw Exception('Server rejected sync payload: ${response.statusCode}');
    }
  }
}
