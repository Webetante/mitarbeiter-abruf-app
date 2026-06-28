import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  AuthService(this._client);

  final SupabaseClient _client;

  Future<void> signIn({
    required String email,
    required String password,
    String? branchId,
  }) async {
    await _client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );
  }

  Future<void> signUpEmployee({
    required String fullName,
    required String phone,
    required String email,
    required String password,
    String? branchId,
  }) async {
    final response = await _client.auth.signUp(
      email: email.trim(),
      password: password,
    );

    final user = response.user;

    if (user == null) {
      throw Exception('Registrierung fehlgeschlagen. Bitte E-Mail bestätigen oder erneut versuchen.');
    }

    await _client.from('profiles').insert({
      'id': user.id,
      'full_name': fullName.trim(),
      'phone': phone.trim(),
      'role': 'employee',
      'branch_id': branchId,
      'active': true,
    });
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}
