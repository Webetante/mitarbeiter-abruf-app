import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/branch.dart';

class BranchService {
  BranchService(this._client);

  final SupabaseClient _client;

  Future<List<Branch>> fetchActiveBranches() async {
    final response = await _client
        .from('branches')
        .select('id, name, address, city')
        .eq('active', true)
        .order('name');

    return response
        .map<Branch>((item) => Branch.fromMap(item as Map<String, dynamic>))
        .toList();
  }
}
